# Yarn Spinner's Office Frame
# Written in 2024 by Jon Manning

# Notes:
# - This script was written for Pimeroni Pico firmware v1.23.0. You'll need to
#   download and flash your chip to this firmware.
#   https://github.com/pimoroni/pimoroni-pico/releases/tag/v1.23.0-1
# - This script connects to the wifi, and then once an hour downloads and
#   displays an image from a URL.
# - The script will only do this during office hours (see the
#   DONT_REFRESH_OUTSIDE_OF variable below.)
# - The image must be the same resolution as your Inky Frame. For an Inky Frame
#   7.3, that's 800x480.
# - Make sure to import the appropriate version of DISPLAY_INKY_FRAME in the
#   'imports' section at the top of the script.
# - The script requires an SD card, because it downloads the image to the card
#   and then effectively uses it as memory (because the downloaded PNG may
#   exceed the amount of available RAM)
# - Hit the A button on the Inky Frame to force a reload.
# - The LED on the E button will be illuminated when downloading and rendering
#   the image.

import inky_helper as ih
import gc
import requests
from pngdec import PNG, PNG_COPY
from picographics import PicoGraphics, DISPLAY_INKY_FRAME_7
import time
import ntptime
from machine import Pin, SPI
import sdcard
import os

# Sleep for 2 seconds to allow any initial setup or boot processes to complete.
time.sleep(2)

DISPLAY_TYPE = DISPLAY_INKY_FRAME_7

# Define Wi-Fi credentials
WIFI_SSID = "Your SSID"
WIFI_PASSWORD = "your-wifi-password"

# Define UTC offset for localtime
UTC_OFFSET = 10 * 60 * 60

# Define update frequency and delay between updates in seconds.
UPDATE_FREQUENCY = 0.1
DELAY_BETWEEN_UPDATES = 60 * 60

# URL for the image to be fetched from a local server.
IMG_URL = "http://gunther.local:8080/image"

# Define the file name where the fetched image will be saved on the SD card.
FILENAME = "/sd/lab-frame.png"

# The frame will not update the image if the local time's current hour is less
# than the first number, or greater than the second
DONT_REFRESH_OUTSIDE_OF = [8, 17]

# Flag to check if the SD card is mounted.
card_mounted = False

# Try to access the SD card directory; if it fails, attempt to mount the SD card.
try:
    os.stat("/sd")
    card_mounted = True
except OSError:
    print("Attempting to mount SD card...")

    # Set up the SPI interface for communication with the SD card.
    sd_spi = SPI(0, sck=Pin(18, Pin.OUT), mosi=Pin(19, Pin.OUT), miso=Pin(16, Pin.OUT))

    # Initialize and mount the SD card using the configured SPI interface.
    sd = sdcard.SDCard(sd_spi, Pin(22))
    os.mount(sd, "/sd")
    print("Mounted at /sd")


# config = load(open("/sd/config.json"))


def current_local_time():
    actual_time = time.localtime(time.time() + UTC_OFFSET)
    return actual_time


def fetch_and_display():
    ih.inky_frame.button_e.led_on()

    print("Connecting to wifi...")
    ih.network_connect(WIFI_SSID, WIFI_PASSWORD)

    gc.collect()

    print("Fetching image...")

    try:
        response = requests.request("GET", IMG_URL)
    except Exception as e:
        print("Failed to fetch image!")
        print(e)
        ih.inky_frame.button_e.led_off()
        return

    with open(FILENAME, "wb") as f:
        f.write(response.content)

    print(f"Fetched {len(response.content)} bytes")

    gc.collect()

    print("Loading image...")
    display = PicoGraphics(display=DISPLAY_TYPE)

    png = PNG(display)

    png.open_file(FILENAME)
    png.decode(0, 0, 1, mode=PNG_COPY)

    print("Updating display...")

    display.update()

    print("Done.")
    ih.inky_frame.button_e.led_off()
    gc.collect()


def set_time():
    while True:
        # Set the current time
        ih.network_connect(WIFI_SSID, WIFI_PASSWORD)
        print("Updating time...")
        try:
            ntptime.settime()
            return
        except:
            print("Failed to set time!")
            time.sleep(5)


def main():
    set_time()
    fetch_and_display()

    time_remaining = DELAY_BETWEEN_UPDATES

    while True:
        force_refresh = False
        if ih.inky_frame.button_a.read():
            ih.inky_frame.button_a.led_on()
            time_remaining = 0
            force_refresh = True

        if time_remaining <= 0:
            current_time = current_local_time()
            current_local_time_hour = current_time[3]

            if not force_refresh and (
                current_local_time_hour < DONT_REFRESH_OUTSIDE_OF[0]
                or current_local_time_hour > DONT_REFRESH_OUTSIDE_OF[1]
            ):
                print("Skipping update because we're out of office hours.")
            else:
                fetch_and_display()

            time_remaining = DELAY_BETWEEN_UPDATES

        time.sleep(UPDATE_FREQUENCY)
        time_remaining -= UPDATE_FREQUENCY

        ih.inky_frame.button_a.led_off()


main()

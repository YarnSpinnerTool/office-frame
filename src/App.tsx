import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CalendarView } from "./Calendar";

const queryClient = new QueryClient();

function App() {
    const now = new Date();

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <div
                    className="content"
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <div
                        style={{
                            height: "2rem",
                            borderBottom: "2px solid var(--black)",
                        }}
                    >
                        Welcome to <strong>Yarn Spinner</strong>
                    </div>
                    <div
                        style={{
                            flexGrow: 1,
                            overflow: "hidden",
                            width: "100%",
                        }}
                    >
                        <CalendarView
                            after={new Date()}
                            count={15}
                            style={{
                                paddingTop: "8px",
                                paddingBottom: "8px",

                                display: "flex",
                                height: "100%",
                                width: "100%",
                                // Overflow to new columns
                                flexDirection: "column",
                                flexFlow: "column wrap",
                            }}
                            // Ensure each child is the full width - this will
                            // force overflowing children to the next
                            // (off-screen, not-visible) column
                            childStyle={{ width: "100%" }}
                        />
                    </div>
                    <div
                        style={{
                            height: "2rem",
                            borderTop: "2px solid var(--black)",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div></div>
                        <div>
                            Updated:{" "}
                            {now.toLocaleString("en-au", {
                                dateStyle: "long",
                                timeStyle: "short",
                            })}
                        </div>
                    </div>
                </div>
            </QueryClientProvider>
        </>
    );
}

export default App;

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
                    <div style={{ flexGrow: 1, overflow: "hidden" }}>
                        <CalendarView after={new Date()} count={9} />
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

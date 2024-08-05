function App() {

  const now = new Date();

  return (
    <>
      <div className="content" style={{display: "flex", flexDirection: "column"}}>
          <div style={{height: "2rem", borderBottom: "2px solid var(--black)"}}>
            Welcome to <strong>Yarn Spinner</strong>
          </div>
          <div style={{flexGrow: 1, overflow: "hidden"}}>
            {"Hello, world! ".repeat(4000)}
            </div>
          <div style={{height: "2rem", borderTop: "2px solid var(--black)", display:"flex", justifyContent: "space-between"}}>
          <div></div>
          <div>Updated: {now.toLocaleString("en-au", {
            dateStyle: "long",
            timeStyle: "short"
            
          })}</div>
          </div>
        
      </div>
    </>
  )
}

export default App

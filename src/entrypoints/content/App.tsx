const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (message: {type: string}) => {
      if(message.type === "TOGGLE_OVERLAY") {
        console.log("message received: ", message);
        setIsOpen(prevIsOpen => !prevIsOpen);
      }
    }

    browser.runtime.onMessage.addListener(handleMessage);
    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div
      className={
        `${isOpen ? "flex" : "hidden"} 
        w-90 p-2 fixed z-10000 top-6 right-16 
        rounded-3xl flex-col gap-4 bg-pink-300`
      }
    >
      <h2 className="text-3xl">Hello World</h2>
    </div>
  )
}
export default App

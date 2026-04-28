interface PauseProps {
  className?: string;
}

const Pause = ({className}: PauseProps) => {
  return (
    <svg className={className} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M5.5 2.5c.27614 0 .5.22386.5.5v10c-.00002.2761-.22387.5-.5.5s-.49998-.2239-.5-.5V3c0-.27614.22386-.5.5-.5m6 0c.2761 0 .5.22386.5.5v10c0 .2761-.2239.5-.5.5s-.5-.2239-.5-.5V3c0-.27614.2239-.5.5-.5"/>
    </svg>
  )
};
export default Pause;
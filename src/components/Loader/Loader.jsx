import BeatLoader from "react-spinners/BeatLoader";

function Loader() {
  return (
    <div
      className="sweet-loading flex justify-center items-center h-[100vh] bg-blue-900"
      style={{ background: "rgb(24, 12, 46)" }}
    >
      <BeatLoader
        color="#36d7b7"
        loading={true}
        size={40}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}

export default Loader;

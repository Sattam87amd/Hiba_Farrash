import { useState } from "react";

const GroupSession = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="flex flex-col w-full">
      {/* <h2 className="text-3xl font-semibold">Group Session</h2> */}
      <div className="flex justify-between items-center mt-8">
        {/* <span className="text-gray-700 text-lg">Allow Group Sessions</span> */}
        {/* <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={() => setIsEnabled(!isEnabled)}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
        </label> */}
      </div>
    </div>
  );
};

export default GroupSession;

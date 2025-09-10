import { FC } from "react";

const Loading: FC = () => {

  return (
    <div className="w-full h-full min-h-[600px] bg-[#1e1e1e] text-white flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* VSCode-like header */}
      <div className="h-8 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#28ca42]"></div>
        </div>
        <div className="ml-4 text-sm text-gray-300">
          Monaco Editor - Loading Repository...
        </div>
      </div>

      {/* Loading content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-300 mb-2">
            Loading Repository Files
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading;
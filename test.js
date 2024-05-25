<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
  <Dialog.Title
    as="h2"
    className="text-xl mb-5 font-semibold leading-6 text-gray-900"
  >
    Roll
  </Dialog.Title>
  <div className="mt-2">
    <div className="min-w-full divide-y divide-gray-200 ">
      <div className="bg-gray-50 ">
        <div className="flex">
          <div
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Roll
          </div>
          <div
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Row Index
          </div>

          <div
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Edit
          </div>
          <div
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Remove
          </div>
          {/* Add more th for additional columns */}
        </div>
      </div>

      <div className="">
        <div
          key={index}
          className={index % 2 === 0 ? "bg-white flex" : "bg-teal-100 flex"}
        >
          <div className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            data
          </div>
          <div className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            123123
          </div>
          <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button
              onClick={() => onEditModalHandler(data)}
              className="border-e px-3 bg-gray-100 py-2 text-sm/none text-gray-600 rounded hover:bg-gray-200 hover:text-gray-700"
            >
              Edit
            </button>
          </div>
          <div
            className="px-6 py-4 whitespace-nowrap text-red-500
                                                                text-2xl ml-8 "
            onClick={() =>
              onRemoveDuplicateHandler(index, data.index, data.row[columnName])
            }
          >
            <MdDelete className="mx-auto" />
          </div>
          {/* Add more td for additional columns */}
        </div>
      </div>
    </div>
  </div>
</div>;

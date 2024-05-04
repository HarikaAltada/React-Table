import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import DebouncedInput from "./DebouncedInput";
import { SearchIcon } from "../Icons/Icons";

const TanStackTable = () => {
  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("", {
      id: "S.No",
      cell: (info) => <span>{info.row.index + 1}</span>,
      header: "S.No",
    }),

    columnHelper.accessor("athlete", {
      cell: (info) => (
        <span
          contentEditable
          onKeyDown={(e) => handleKeyDown(e)}
          onAbort={(e) =>
            handleCellEdit(info.row.index, "athlete", e.target.innerText)
          }
        >
          {info.getValue()}
        </span>
      ),
      header: "Athlete",
    }),
    columnHelper.accessor("year", {
      cell: (info) => (
        <span
          contentEditable
          onKeyDown={(e) => handleKeyDown(e)}
          onAbort={(e) =>
            handleCellEdit(info.row.index, "year", e.target.innerText)
          }
        >
          {info.getValue()}
        </span>
      ),
      header: "Year",
    }),
    columnHelper.accessor("country", {
      cell: (info) => (
        <span
          contentEditable
          onKeyDown={(e) => handleKeyDown(e)}
          onAbort={(e) =>
            handleCellEdit(info.row.index, "country", e.target.innerText)
          }
        >
          {info.getValue()}
        </span>
      ),
      header: "Country",
    }),
    columnHelper.accessor("age", {
      cell: (info) => (
        <span
          contentEditable
          onKeyDown={(e) => handleKeyDown(e)}
          onAbort={(e) =>
            handleCellEdit(info.row.index, "age", e.target.innerText)
          }
        >
          {info.getValue()}
        </span>
      ),
      header: "Age",
    }),
  ];

  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    // Fetch data from the API
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Extract required fields from the fetched data
        const extractedData = data.map(({ athlete, year, country, age }) => ({
          athlete,
          year,
          country,
          age,
        }));
        setData(extractedData);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleCellEdit = (rowIndex, columnId, value) => {
    const newData = [...data];
    newData[rowIndex][columnId] = value;
    setData(newData);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className="p-2 max-w-5xl mx-auto text-white fill-gray-400">
      <div className="flex justify-between mb-2">
        <div className="w-full flex items-center gap-1">
          <SearchIcon />
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            className="p-2 bg-transparent outline-none border-b-2 w-1/5 focus:w-1/3 duration-300 border-indigo-500"
            placeholder="Search all columns..."
          />
        </div>
      </div>
      <table className="border border-gray-700 w-full text-left table-fixed">
        <thead className="bg-indigo-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="capitalize px-3.5 py-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`
                  ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                  `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3.5 py-2 overflow-hidden whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="text-center h-32">
              <td colSpan={12}>No Record Found!</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* pagination */}
      <div className="flex items-center justify-end mt-2 gap-2">
        <button
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
          className="p-1 border border-gray-300 px-2 disabled:opacity-30"
        >
          {"<"}
        </button>
        <button
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
          className="p-1 border border-gray-300 px-2 disabled:opacity-30"
        >
          {">"}
        </button>

        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16 bg-transparent"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="p-2 bg-transparent"
        >
          {[10, 20, 30, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize} className="bg-black">
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TanStackTable;

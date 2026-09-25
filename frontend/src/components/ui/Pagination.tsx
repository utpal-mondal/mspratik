import React from "react";

interface PaginationProps {
  currentPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  total,
  perPage,
  onPageChange,
}) => {
  const getPagination = () => {
    const totalPages = Math.ceil(total / perPage);
    const pageNeighbours = 2;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const startPage = Math.max(2, currentPage - pageNeighbours);
    const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

    pages.push(1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const handlePrevious = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  const isLastPage = currentPage * perPage >= total;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-white to-blue-50 px-4 py-3 sm:px-6 transition-all duration-300">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isLastPage}
          className="relative ml-3 inline-flex items-center rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="animate-fadeIn">
          <p className="text-sm text-gray-700 bg-blue-50 px-3 py-1 rounded-full shadow-inner">
            Showing{" "}
            <span className="font-medium text-blue-700">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-blue-700">
              {Math.min(currentPage * perPage, total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-blue-700">{total}</span>{" "}
            results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-md"
            aria-label="Pagination"
          >
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-blue-600 ring-1 ring-inset ring-blue-300 hover:bg-blue-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-all duration-300"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {getPagination().map((p, index) => {
              if (typeof p === "string") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    currentPage === p
                      ? "bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={handleNext}
              disabled={isLastPage}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-blue-600 ring-1 ring-inset ring-blue-300 hover:bg-blue-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-all duration-300"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

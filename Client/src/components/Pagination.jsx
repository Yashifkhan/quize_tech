import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showNumbers = true,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleFirst = () => onPageChange(1);
  const handleLast = () => onPageChange(totalPages);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-5 select-none">
      {/* First Page Button */}
      <button
        onClick={handleFirst}
        disabled={currentPage === 1}
        className="
          w-10 h-10 flex items-center justify-center rounded-2xl
          bg-gradient-to-br from-slate-50 to-slate-100
          border border-gray-200 shadow-sm
          hover:shadow-md hover:scale-105 hover:from-slate-100 hover:to-slate-50
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
          transition-all duration-200 text-gray-700
        "
        title="First page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      </button>

      {/* Prev Button */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="
          px-4 py-2 rounded-2xl backdrop-blur-md 
          bg-gradient-to-br from-white/70 to-slate-50/70
          border border-gray-200 shadow-sm 
          hover:bg-white hover:shadow-md hover:scale-105
          transition-all duration-200
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
          text-sm font-medium text-gray-700
        "
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      {showNumbers && (
        <div className="flex items-center gap-1.5 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <div
                  key={page}
                  className="w-10 h-10 flex items-center justify-center text-gray-400"
                >
                  <span className="text-lg font-bold">···</span>
                </div>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  w-10 h-10 flex items-center justify-center 
                  rounded-2xl text-sm font-semibold transition-all duration-200
                  border backdrop-blur-md
                  ${
                    currentPage === page
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 scale-110"
                      : "bg-gradient-to-br from-white/60 to-slate-50/60 border-gray-200 text-gray-700 hover:from-white/90 hover:to-slate-50/90 hover:shadow-md hover:scale-105"
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="
          px-4 py-2 rounded-2xl backdrop-blur-md
          bg-gradient-to-br from-white/70 to-slate-50/70
          border border-gray-200 shadow-sm 
          hover:bg-white hover:shadow-md hover:scale-105
          transition-all duration-200
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
          text-sm font-medium text-gray-700
        "
      >
        Next →
      </button>

      {/* Last Page Button */}
      <button
        onClick={handleLast}
        disabled={currentPage === totalPages}
        className="
          w-10 h-10 flex items-center justify-center rounded-2xl
          bg-gradient-to-br from-slate-50 to-slate-100
          border border-gray-200 shadow-sm
          hover:shadow-md hover:scale-105 hover:from-slate-100 hover:to-slate-50
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
          transition-all duration-200 text-gray-700
        "
        title="Last page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="13 17 18 12 13 7"></polyline>
          <polyline points="6 17 11 12 6 7"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
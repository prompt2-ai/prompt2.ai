import 
{
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  Pagination as PaginationNav,
  PaginationContent,
} from "@/components/ui/pagination";

export interface PaginationProps {
    totalPages: number;
    totalPagesToDisplay?: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  }
  
  export const Pagination: React.FC<PaginationProps> = ({
    totalPages,
    totalPagesToDisplay = 5,
    currentPage,
    setCurrentPage,
  }: PaginationProps) => {
    const showLeftEllipsis = currentPage - 1 > totalPagesToDisplay / 2;
    const showRightEllipsis = totalPages - currentPage + 1 > totalPagesToDisplay / 2;
    const getPageNumbers = () => {
      if (totalPages <= totalPagesToDisplay) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        const half = Math.floor(totalPagesToDisplay / 2);
        // To ensure that the current page is always in the middle
        let start = currentPage - half;
        let end = currentPage + half;
        // If the current page is near the start
        if (start < 1) {
          start = 1;
          end = totalPagesToDisplay;
        }
        // If the current page is near the end
        if (end > totalPages) {
          start = totalPages - totalPagesToDisplay + 1;
          end = totalPages;
        }
        // If showLeftEllipsis is true, add an ellipsis before the start page
        if (showLeftEllipsis) {
          start++;
        }
        // If showRightEllipsis is true, add an ellipsis after the end page
        if (showRightEllipsis) {
          end--;
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
    };
  
    const renderPaginationItems = () => {
      const pageNumbers = getPageNumbers();
      return pageNumbers.map((pageNumber) => (
        <PaginationItem key={pageNumber}>
          <PaginationLink
            href='#'
            isActive={pageNumber === currentPage}
            onClick={() => setCurrentPage(pageNumber)}
          >
            {pageNumber}
          </PaginationLink>
        </PaginationItem>
      ));
    };
  
    return (
      <PaginationNav>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#'
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          {showLeftEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {renderPaginationItems()}
          {showRightEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              href='#'
              onClick={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationNav>
    );
  };

export default Pagination;
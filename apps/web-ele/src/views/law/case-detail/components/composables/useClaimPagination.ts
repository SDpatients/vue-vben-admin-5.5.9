import { ref } from 'vue';

export function useClaimPagination() {
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const handlePageChange = (page: number) => {
    currentPage.value = page;
  };

  const handlePageSizeChange = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
  };

  const resetPagination = () => {
    currentPage.value = 1;
    pageSize.value = 10;
    total.value = 0;
  };

  return {
    currentPage,
    pageSize,
    total,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  };
}

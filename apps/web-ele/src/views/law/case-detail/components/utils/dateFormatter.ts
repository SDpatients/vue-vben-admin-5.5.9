export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

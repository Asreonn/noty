/**
 * Pin ve İp Bağlantı Sistemı için Path Hesaplama Utilities
 */

/**
 * İki nokta arası gravity efektli bezier path oluşturur (ip gibi sarkık)
 */
export const createStringPath = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Sag (gravity) miktarı - mesafeye göre ama maximum 50px
  const sag = Math.min(distance * 0.15, 50);
  
  // Control point - ip gibi sarkık
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 + sag;
  
  // Quadratic bezier curve (yumuşak eğri)
  return `M ${x1},${y1} Q ${midX},${midY} ${x2},${y2}`;
};

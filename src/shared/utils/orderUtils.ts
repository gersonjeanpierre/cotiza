export const getColorStatus = (statusId: number): string => {
  switch (statusId) {
    case 1: // En espera
      return 'bg-amber-300';
    case 2: // Confirmado
      return 'bg-orange-300';
    case 3: // En preparacion
      return 'bg-yellow-500';
    case 4: // Listo
      return 'bg-green-500';
    case 8: // Completado
      return 'bg-green-300';
    case 9: // Cancelado
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500'; // Desconocido o no definido
  }
}
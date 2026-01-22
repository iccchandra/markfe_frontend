// utils/currencyFormatter.ts

/**
 * Format currency with proper paisa handling and Crores-only format
 */
export const formatCurrency = (amount: number) => {
    if (amount === 0) {
      return '₹0';
    }
  
    // If amount is less than 1 rupee (only paisa)
    if (amount < 1 && amount > 0) {
      const paisaAmount = Math.round(amount * 100);
      return `${paisaAmount} paisa`;
    }
  
    // For amounts >= 1 rupee
    const rupees = Math.floor(amount);
    const paisa = Math.round((amount - rupees) * 100);
  
    const rupeesFormatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(rupees);
  
    if (paisa > 0) {
      return `₹${rupeesFormatted}.${paisa.toString().padStart(2, '0')}`;
    }
  
    return `₹${rupeesFormatted}`;
  };
  
  /**
   * Format currency in Crores for large amounts
   * Uses Crores ONLY, never shows TCr (Thousand Crores)
   */
  export const formatCurrencyInCrores = (amount: number) => {
    if (amount === 0) {
      return '₹0';
    }
  
    // Penny drop
    if (amount === 1 || amount === 0.01) {
      return '₹1';
    }
  
    // Less than 1 rupee (paisa)
    if (amount < 1 && amount > 0) {
      const paisaAmount = Math.round(amount * 100);
      return `${paisaAmount}p`;
    }
  
    // Less than 1 Lakh - show in rupees
    if (amount < 100000) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    }
  
    // 1 Lakh to 1 Crore - show in Lakhs
    if (amount < 10000000) {
      const lakhs = amount / 100000;
      return `₹${lakhs.toFixed(2)}L`;
    }
  
    // 1 Crore and above - ALWAYS show in Crores (never TCr)
    const crores = amount / 10000000;
    
    // For very large amounts (100+ crores), show with fewer decimals
    if (crores >= 100) {
      return `₹${crores.toFixed(2)} Cr`;
    }
    
    // For smaller crores amounts, show 2 decimal places
    return `₹${crores.toFixed(2)} Cr`;
  };
  
  /**
   * Format currency in Crores with custom decimal places
   */
  export const formatInCrores = (amount: number, decimals: number = 2) => {
    if (amount === 0) return '₹0';
    
    const crores = amount / 10000000;
    return `₹${crores.toFixed(decimals)} Cr`;
  };
  
  /**
   * Get amount in crores as number (for calculations)
   */
  export const getAmountInCrores = (amount: number): number => {
    return amount / 10000000;
  };
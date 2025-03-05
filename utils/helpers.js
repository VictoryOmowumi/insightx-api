// utils/helpers.js
exports.formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

exports.formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toFixed(2)}`;
  };

// format currency to short form
exports.formatCurrencyShort = (amount) => {
    return `₦${parseFloat(amount).toFixed(0)}`;
  };

// format currency to short form like 1.5k, 2.3m, 3.4b
exports.formatCurrencyShortForm = (amount) => {
    if (amount >= 1000000000) {
        return `₦${(amount / 1000000000).toFixed(1)}b`;
    }
    if (amount >= 1000000) {
        return `₦${(amount / 1000000).toFixed(1)}m`;
    }
    if (amount >= 1000) {
        return `₦${(amount / 1000).toFixed(1)}k`;
    }
    return `₦${amount}`;
};
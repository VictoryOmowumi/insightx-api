const regions = [
    { code: '001', description: 'Ikeja' },
    { code: '002', description: 'Ibadan' },
    { code: '003', description: 'Kano' },
    { code: '004', description: 'Kaduna' },
    { code: '005', description: 'Aba' },
    { code: '006', description: 'Ilorin' },
    { code: '007', description: 'Benin' },
    { code: '009', description: 'Enugu' },
    { code: '010', description: 'Abuja' },
  ];
  
  // @desc    Get all regions
  // @route   GET /api/regions
  // @access  Public
  exports.getRegions = (req, res) => {
    res.json(regions);
  };
var inherits = require('util').inherits;

function PowerMeterService(Service) {

    this.PowerMeterService = function() {
        Service.call(this, 'Energy', '00000001-0000-1777-8000-775D67EC4377');
        this.addCharacteristic(CurrentConsumption1);
        this.addCharacteristic(TotalConsumption1);
    };

    inherits(this.PowerMeterService, Service);
    
    
    this.service = new PowerMeterService(this.options['name']);
    this.service.getCharacteristic(CurrentConsumption1).on('get', this.getCurrentConsumption1.bind(this));
    this.service.addCharacteristic(TotalConsumption1).on('get', this.getTotalConsumption1.bind(this));    
    
    
    return this;
}

module.exports.PowerMeterService = PowerMeterService;

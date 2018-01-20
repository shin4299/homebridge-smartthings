var inherits = require('util').inherits;

function EnergyService(Service) {

    this.EnergyService = function(displayName, subtype) {
        Service.call(this, displayName, '00000001-0000-1777-8000-775D67EC4377', subtype);
        this.addCharacteristic(CurrentConsumption1);
        this.addCharacteristic(TotalConsumption1);
    };

    inherits(this.EnergyService, Service);
    return this;
}

module.exports.EnergyService = EnergyService;

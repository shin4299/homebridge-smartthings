var inherits = require('util').inherits;

function EnergyService(Service) {

    this.EnergyService = function(displayName, subtype) {
        Service.call(this, displayName, '00000001-0000-1777-8000-775D67EC4377', subtype);
        this.addCharacteristic(CurrentConsumption1);
        this.addOptionalCharacteristic(TotalConsumption1);
    };

    inherits(EnergyService, Service);

}


function EnergyCharacteristics(Characteristic) {
    this.TotalConsumption1 = function() {
        Characteristic.call(this, 'Total Consumption (kWh*1000)', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: "KWh",
            maxValue: 4294967295,
            minValue: 0,
            minStep: 0.1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
        
        
    };
    inherits(this.TotalConsumption1, Characteristic);

    this.CurrentConsumption1 = function() {
        Characteristic.call(this, 'Current Consumption (W*10)', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: "W",
            maxValue: 65535,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(this.CurrentConsumption1, Characteristic);
    
    
    
    return this;
}

module.exports.EnergyCharacteristics = EnergyCharacteristics;
module.exports.EnergyService = EnergyService;

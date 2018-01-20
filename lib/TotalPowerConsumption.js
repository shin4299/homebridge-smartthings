var inherits = require('util').inherits;

function Power(Characteristic) {
    var TotalPowerConsumption = function() {
        Characteristic.call(this, 'Total Consumption', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.FLOAT, // Deviation from Eve Energy observed type
            unit: 'KWh',
            maxValue: 1000000000,
            minValue: 0,
            minStep: 0.001,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(this.TotalPowerConsumption, Characteristic);    
    return this;
}

module.exports.TotalPowerConsumption = TotalPowerConsumption;

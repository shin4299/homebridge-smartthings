var inherits = require('util').inherits;



function CustomCharacteristics(Characteristic) {

    var TotalConsumption1 = function() {
        Characteristic.call(this, 'Total Consumption', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: 'KWh',
            maxValue: 4294967295,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
        
        
    };
    inherits(TotalConsumption1, Characteristic);

    var CurrentConsumption1 = function() {
        Characteristic.call(this, 'Current Consumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
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
    inherits(CurrentConsumption1, Characteristic);
    
    return this;
}

module.exports.CustomCharacteristics = CustomCharacteristics;

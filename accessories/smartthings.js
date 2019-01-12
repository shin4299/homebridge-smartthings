var inherits = require('util').inherits;

var Accessory, Service, Characteristic, uuid, EnergyCharacteristics;

/*
 *   SmartThings Accessory
 */

module.exports = function (oAccessory, oService, oCharacteristic, ouuid) {
    if (oAccessory) {
        Accessory = oAccessory;
        Service = oService;
        Characteristic = oCharacteristic;
        EnergyCharacteristics = require('../lib/customCharacteristics').EnergyCharacteristics(Characteristic)

        uuid = ouuid;

        inherits(SmartThingsAccessory, Accessory);
        SmartThingsAccessory.prototype.loadData = loadData;
        SmartThingsAccessory.prototype.getServices = getServices;

    }
    return SmartThingsAccessory;
};
module.exports.SmartThingsAccessory = SmartThingsAccessory;

function SmartThingsAccessory(platform, device) {

    this.deviceid = device.deviceid;
    this.name = device.name;
    this.platform = platform;
    this.state = {};
    this.device = device;

    var idKey = 'hbdev:smartthings:' + this.deviceid;
    var id = uuid.generate(idKey);

    Accessory.call(this, this.name, id);
    var that = this;

    //Get the Capabilities List
    for (var index in device.capabilities) {
        if ((platform.knownCapabilities.indexOf(index) == -1) && (platform.unknownCapabilities.indexOf(index) == -1))
            platform.unknownCapabilities.push(index);
    }

    this.getaddService = function (Service) {
        var myService = this.getService(Service);
        if (!myService) myService = this.addService(Service);
        return myService
    };

    this.deviceGroup = "unknown"; //This way we can easily tell if we set a device group
    var thisCharacteristic;


    if (device.capabilities["Switch Level"] !== undefined) {
        if (device.commands.levelOpenClose) {
            //This is a Window Shade
            this.deviceGroup = "shades"

            thisCharacteristic = this.getaddService(Service.WindowCovering).getCharacteristic(Characteristic.TargetPosition)
            thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
            thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
            that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.WindowCovering).getCharacteristic(Characteristic.CurrentPosition)
            thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
            that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);

        } else if (device.commands.levelOpenClose2) {
            //This is a Window Shade
            this.deviceGroup = "shades"

            thisCharacteristic = this.getaddService(Service.WindowCovering).getCharacteristic(Characteristic.TargetPosition)
            thisCharacteristic.on('get', function (callback) {
                if (that.device.attributes.level >= 99)
                    callback(null, parseInt(100));
                else if (that.device.attributes.level <= 98)
                    callback(null, parseInt(that.device.attributes.level));
            });
            thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
            that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.WindowCovering).getCharacteristic(Characteristic.CurrentPosition)
            thisCharacteristic.on('get', function (callback) {
                if (that.device.attributes.level >= 99)
                    callback(null, parseInt(100));
                else if (that.device.attributes.level <= 98)
                    callback(null, parseInt(that.device.attributes.level));
            });
            that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);

        } else if (device.commands.swingfan) {
            //This is a Ceiling Fan
            this.deviceGroup = "fans"

            thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.Active)
            thisCharacteristic.on('get', function (callback) {
                if (that.device.attributes.switch == "on")
                    callback(null, Characteristic.Active.ACTIVE);
                else
                    callback(null, Characteristic.Active.INACTIVE);
            });
            thisCharacteristic.on('set', function (value, callback) {
                if (value)
                    that.platform.api.runCommand(callback, that.deviceid, "on");
                else
                    that.platform.api.runCommand(callback, that.deviceid, "off");
            });
            that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.RotationSpeed)
            thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
            thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
            that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);

            /*    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
                thisCharacteristic.on('set', function (value, callback) {
                    if (value > 0)
                        that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value });
                });
                that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);
            */

            thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.SwingMode)
            thisCharacteristic.on('get', function (callback) {
                if (that.device.attributes.setangle == "off")
                    callback(null, Characteristic.SwingMode.SWING_DISABLED);
                else
                    callback(null, Characteristic.SwingMode.SWING_ENABLED);
            });
            thisCharacteristic.on('set', function (value, callback) {
                if (value == Characteristic.SwingMode.SWING_ENABLED)
                    that.platform.api.runCommand(callback, that.deviceid, "setAngleOn");
                else if (value == Characteristic.SwingMode.SWING_DISABLED)
                    that.platform.api.runCommand(callback, that.deviceid, "setAngleOff");
            });
            that.platform.addAttributeUsage("setangle", this.deviceid, thisCharacteristic);
            /*
                thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.TargetFanState)
                thisCharacteristic.on('get', function (callback) {
                    if (that.device.attributes.fanmode == 'natural')
                        callback(null, Characteristic.TargetFanState.AUTO);
                    else if (that.device.attributes.fanmode == 'general')
                        callback(null, Characteristic.TargetFanState.MANUAL);
                });
                thisCharacteristic.on('set', function (value, callback) {
                    if (value == Characteristic.TargetFanState.MANUAL) {
                        that.platform.api.runCommand(callback, that.deviceid, "generalOn");
                    } else if (value == Characteristic.TargetFanState.AUTO) {
                        that.platform.api.runCommand(callback, that.deviceid, "naturalOn");
                    }
                });
                that.platform.addAttributeUsage("fanmode", this.deviceid, thisCharacteristic);
            */
            thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.RotationDirection)
            thisCharacteristic.on('get', function (callback) {
                if (that.device.attributes.fanmode == 'natural')
                    callback(null, Characteristic.RotationDirection.COUNTER_CLOCKWISE);
                else if (that.device.attributes.fanmode == 'general')
                    callback(null, Characteristic.RotationDirection.CLOCKWISE);
            });
            thisCharacteristic.on('set', function (value, callback) {
                if (value == Characteristic.RotationDirection.CLOCKWISE) {
                    that.platform.api.runCommand(callback, that.deviceid, "generalOn");
                } else if (value == Characteristic.RotationDirection.COUNTER_CLOCKWISE) {
                    that.platform.api.runCommand(callback, that.deviceid, "naturalOn");
                }
            });
            that.platform.addAttributeUsage("fanmode", this.deviceid, thisCharacteristic);

        }
        
    else if (device.commands.airpurifier) {
    this.deviceGroup = "airpurifier";
    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.Active)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.Active.ACTIVE);
        else
            callback(null, Characteristic.Active.INACTIVE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.CurrentAirPurifierState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.CurrentAirPurifierState.PURIFYING_AIR);
        else
            callback(null, Characteristic.CurrentAirPurifierState.INACTIVE);
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.TargetAirPurifierState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.mode == "auto")
            callback(null, Characteristic.TargetAirPurifierState.AUTO);
        else
            callback(null, Characteristic.TargetAirPurifierState.MANUAL);
    });
    thisCharacteristic.on('set', function (value, callback) {
        // that.platform.log(that.deviceid + ' set value : ' + value);
        if (value == Characteristic.TargetAirPurifierState.AUTO) {
            that.platform.api.runCommand(callback, that.deviceid, "setModeAuto");
        } else if (value == Characteristic.TargetAirPurifierState.MANUAL) {
            that.platform.api.runCommand(callback, that.deviceid, "setModeSilent");
        }
    });
    that.platform.addAttributeUsage("mode", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.RotationSpeed).setProps({ minValue: 0, maxValue: 5 });
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.mode == "auto")
            callback(null, parseInt(0));
        else if (that.device.attributes.mode == "silent")
            callback(null, parseInt(1));
        else if (that.device.attributes.mode == "low")
            callback(null, parseInt(2));
        else if (that.device.attributes.mode == "medium")
            callback(null, parseInt(3));
        else if (that.device.attributes.mode == "high")
            callback(null, parseInt(4));
        else if (that.device.attributes.mode == "strong")
            callback(null, parseInt(5));
        else
            callback(null, parseInt(0));
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value == 0)
            that.platform.api.runCommand(callback, that.deviceid, "setModeAuto");
        else if (value == 1)
            that.platform.api.runCommand(callback, that.deviceid, "setModeSilent");
        else if (value == 2)
            that.platform.api.runCommand(callback, that.deviceid, "setModeLow");
        else if (value == 3)
            that.platform.api.runCommand(callback, that.deviceid, "setModeMedium");
        else if (value == 4)
            that.platform.api.runCommand(callback, that.deviceid, "setModeHigh");
        else if (value == 5)
            that.platform.api.runCommand(callback, that.deviceid, "setModeStrong");
    });
    that.platform.addAttributeUsage("mode", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.PM2_5Density)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.fineDustLevel)); })
    that.platform.addAttributeUsage("fineDustLevel", this.deviceid, thisCharacteristic);

	    if (device.capabilities["Power Meter"] !== undefined) {
            thisCharacteristic = this.getaddService(Service.AirPurifier).addCharacteristic(Characteristic.CarbonDioxideLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); })
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
		    if (device.capabilities["Energy Meter"] !== undefined) {
            thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.CarbonDioxidePeakLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.energy)); })
            that.platform.addAttributeUsage("energy", this.deviceid, thisCharacteristic);
		    }
        	}
}

else if (device.commands.airpurifier2) {
    this.deviceGroup = "airpurifier";
    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.Active)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.Active.ACTIVE);
        else
            callback(null, Characteristic.Active.INACTIVE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.CurrentAirPurifierState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.CurrentAirPurifierState.PURIFYING_AIR);
        else
            callback(null, Characteristic.CurrentAirPurifierState.INACTIVE);
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.TargetAirPurifierState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.mode == "auto")
            callback(null, Characteristic.TargetAirPurifierState.AUTO);
        else
            callback(null, Characteristic.TargetAirPurifierState.MANUAL);
    });
    thisCharacteristic.on('set', function (value, callback) {
        // that.platform.log(that.deviceid + ' set value : ' + value);
        if (value == Characteristic.TargetAirPurifierState.AUTO) {
            that.platform.api.runCommand(callback, that.deviceid, "setModeAuto");
        } else if (value == Characteristic.TargetAirPurifierState.MANUAL) {
            that.platform.api.runCommand(callback, that.deviceid, "setModeFavorite");
        }
    });
    that.platform.addAttributeUsage("mode", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.RotationSpeed)
    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.fanSpeed)); });
    thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setFanSpeed", { value1: value }); });
    that.platform.addAttributeUsage("fanSpeed", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.AirPurifier).getCharacteristic(Characteristic.PM2_5Density)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.fineDustLevel)); })
    that.platform.addAttributeUsage("fineDustLevel", this.deviceid, thisCharacteristic);

}

        
else if (device.commands.xiaomivacuums) {
    //This is a Ceiling Fan
    this.deviceGroup = "fans"

    thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.Active)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.Active.ACTIVE);
        else
            callback(null, Characteristic.Active.INACTIVE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "charge");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.RotationSpeed).setProps({ minValue: 0, maxValue: 3 });
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.fanSpeed == "quiet")
            callback(null, parseInt(0));
        else if (that.device.attributes.fanSpeed == "balanced")
            callback(null, parseInt(1));
        else if (that.device.attributes.fanSpeed == "turbo")
            callback(null, parseInt(2));
        else if (that.device.attributes.fanSpeed == "fullSpeed")
            callback(null, parseInt(3));
        else
            callback(null, parseInt(0));
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value == 0)
            that.platform.api.runCommand(callback, that.deviceid, "quiet");
        else if (value == 1)
            that.platform.api.runCommand(callback, that.deviceid, "balanced");
        else if (value == 2)
            that.platform.api.runCommand(callback, that.deviceid, "turbo");
        else if (value == 3)
            that.platform.api.runCommand(callback, that.deviceid, "fullSpeed");
    });
    that.platform.addAttributeUsage("fanSpeed", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.SwingMode)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.mode == "spot-cleaning")
            callback(null, Characteristic.SwingMode.SWING_ENABLED);
        else
            callback(null, Characteristic.SwingMode.SWING_DISABLED);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value == Characteristic.SwingMode.SWING_ENABLED)
            that.platform.api.runCommand(callback, that.deviceid, "spotClean");
        else if (value == Characteristic.SwingMode.SWING_DISABLED)
            that.platform.api.runCommand(callback, that.deviceid, "on");
    });
    that.platform.addAttributeUsage("mode", this.deviceid, thisCharacteristic);
   
    thisCharacteristic = this.getaddService(Service.Fanv2).getCharacteristic(Characteristic.RotationDirection)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.paused == 'restart')
            callback(null, Characteristic.RotationDirection.COUNTER_CLOCKWISE);
        else if (that.device.attributes.paused == 'paused')
            callback(null, Characteristic.RotationDirection.CLOCKWISE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value == Characteristic.RotationDirection.CLOCKWISE) {
            that.platform.api.runCommand(callback, that.deviceid, "on");
        } else if (value == Characteristic.RotationDirection.COUNTER_CLOCKWISE) {
            that.platform.api.runCommand(callback, that.deviceid, "paused");
        }
    });
    that.platform.addAttributeUsage("paused", this.deviceid, thisCharacteristic);

}        
            
        else if (device.commands.humidifier) {
    this.deviceGroup = "humidifier";
    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.Active)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.Active.ACTIVE);
        else
            callback(null, Characteristic.Active.INACTIVE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.CurrentHumidifierDehumidifierState).setProps({ validValues: [0, 2] });
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.CurrentHumidifierDehumidifierState.HUMIDIFYING);
        else
            callback(null, Characteristic.CurrentHumidifierDehumidifierState.INACTIVE);
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.TargetHumidifierDehumidifierState).setProps({ validValues: [1] });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.CurrentRelativeHumidity)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.humidity)); });
    that.platform.addAttributeUsage("humidity", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.RelativeHumidityHumidifierThreshold)
    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
    thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
    that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.RotationSpeed).setProps({ minValue: 0, maxValue: 3 });
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.mode == "auto")
            callback(null, parseInt(0));
        else if (that.device.attributes.mode == "silent")
            callback(null, parseInt(1));
        else if (that.device.attributes.mode == "medium")
            callback(null, parseInt(2));
        else if (that.device.attributes.mode == "hight")
            callback(null, parseInt(3));
        else
            callback(null, parseInt(0));
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value == 0)
            that.platform.api.runCommand(callback, that.deviceid, "setModeAuto");
        else if (value == 1)
            that.platform.api.runCommand(callback, that.deviceid, "setModeSilent");
        else if (value == 2)
            that.platform.api.runCommand(callback, that.deviceid, "setModeMedium");
        else if (value == 3)
            that.platform.api.runCommand(callback, that.deviceid, "setModeHigh");
    });
    that.platform.addAttributeUsage("mode", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.WaterLevel)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.water)); });
    that.platform.addAttributeUsage("water", this.deviceid, thisCharacteristic);
	
	    if (device.capabilities["Power Meter"] !== undefined) {
            thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).addCharacteristic(Characteristic.CarbonDioxideLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); })
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
		    if (device.capabilities["Energy Meter"] !== undefined) {
            thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.CarbonDioxidePeakLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.energy)); })
            that.platform.addAttributeUsage("energy", this.deviceid, thisCharacteristic);
		    }
        	}

}

else if (device.commands.dehumidifier) {
    this.deviceGroup = "humidifier"
    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.Active)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.Active.ACTIVE);
        else
            callback(null, Characteristic.Active.INACTIVE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.CurrentHumidifierDehumidifierState).setProps({ validValues: [0, 3] });
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.CurrentHumidifierDehumidifierState.DEHUMIDIFYING);
        else
            callback(null, Characteristic.CurrentHumidifierDehumidifierState.INACTIVE);
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.TargetHumidifierDehumidifierState).setProps({ validValues: [2] });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.CurrentRelativeHumidity)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.humidity)); });
    that.platform.addAttributeUsage("humidity", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.RelativeHumidityDehumidifierThreshold)
    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
    thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
    that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);
    
    thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.WaterLevel)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.water)); });
    that.platform.addAttributeUsage("water", this.deviceid, thisCharacteristic);

	    if (device.capabilities["Power Meter"] !== undefined) {
            thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).addCharacteristic(Characteristic.CarbonDioxideLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); })
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
		    if (device.capabilities["Energy Meter"] !== undefined) {
            thisCharacteristic = this.getaddService(Service.HumidifierDehumidifier).getCharacteristic(Characteristic.CarbonDioxidePeakLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.energy)); })
            that.platform.addAttributeUsage("energy", this.deviceid, thisCharacteristic);
		    }
        	}


}



else if (device.commands.lowSpeed) {
    //This is a Ceiling Fan
    this.deviceGroup = "fans"

    thisCharacteristic = this.getaddService(Service.Fan).getCharacteristic(Characteristic.On)
    thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Fan).getCharacteristic(Characteristic.RotationSpeed)
    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
    thisCharacteristic.on('set', function (value, callback) {
        if (value > 0)
            that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value });
    });
    that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);


} else if (device.commands.setLevel) {
	 if (device.commands.noSwitch) {
        this.deviceGroup = "noneed";
    } else {
    this.deviceGroup = "lights";
    thisCharacteristic = this.getaddService(Service.Lightbulb).getCharacteristic(Characteristic.On)
    thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Lightbulb).getCharacteristic(Characteristic.Brightness)
    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
    thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
    that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);

    if (device.capabilities["Color Control"] !== undefined) {
        thisCharacteristic = this.getaddService(Service.Lightbulb).getCharacteristic(Characteristic.Hue)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.hue * 3.6)); });
        thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setHue", { value1: Math.round(value / 3.6) }); });
        that.platform.addAttributeUsage("hue", this.deviceid, thisCharacteristic);

        thisCharacteristic = this.getaddService(Service.Lightbulb).getCharacteristic(Characteristic.Saturation)
        thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.saturation)); });
        thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setSaturation", { value1: value }); });
        that.platform.addAttributeUsage("saturation", this.deviceid, thisCharacteristic);
    }
    }
}
    }

if (device.capabilities["Garage Door Control"] !== undefined) {
    this.deviceGroup = "garage_doors";

    thisCharacteristic = this.getaddService(Service.GarageDoorOpener).getCharacteristic(Characteristic.TargetDoorState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.door == 'closed' || that.device.attributes.door == 'closing')
            callback(null, Characteristic.TargetDoorState.CLOSED);
        else if (that.device.attributes.door == 'open' || that.device.attributes.door == 'opening')
            callback(null, Characteristic.TargetDoorState.OPEN);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value == Characteristic.TargetDoorState.OPEN) {
            that.platform.api.runCommand(callback, that.deviceid, "open");
            that.device.attributes.door = "opening";
        } else if (value == Characteristic.TargetDoorState.CLOSED) {
            that.platform.api.runCommand(callback, that.deviceid, "close");
            that.device.attributes.door = "closing";
        }
    });
    that.platform.addAttributeUsage("door", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.GarageDoorOpener).getCharacteristic(Characteristic.CurrentDoorState)
    thisCharacteristic.on('get', function (callback) {
        switch (that.device.attributes.door) {
            case 'open':
                callback(null, Characteristic.TargetDoorState.OPEN);
                break;
            case 'opening':
                callback(null, Characteristic.TargetDoorState.OPENING);
                break;
            case 'closed':
                callback(null, Characteristic.TargetDoorState.CLOSED);
                break;
            case 'closing':
                callback(null, Characteristic.TargetDoorState.CLOSING);
                break;
            default:
                callback(null, Characteristic.TargetDoorState.STOPPED);
                break;
        }
    });
    that.platform.addAttributeUsage("door", this.deviceid, thisCharacteristic);

    this.getaddService(Service.GarageDoorOpener).setCharacteristic(Characteristic.ObstructionDetected, false);
}

if (device.capabilities["Lock"] !== undefined) {
    this.deviceGroup = "locks";

    thisCharacteristic = this.getaddService(Service.LockMechanism).getCharacteristic(Characteristic.LockCurrentState)
    thisCharacteristic.on('get', function (callback) {
        switch (that.device.attributes.lock) {
            case 'locked':
                callback(null, Characteristic.LockCurrentState.SECURED);
                break;
            case 'unlocked':
                callback(null, Characteristic.LockCurrentState.UNSECURED);
                break;
            default:
                callback(null, Characteristic.LockCurrentState.UNKNOWN);
                break;
        }
    });
    that.platform.addAttributeUsage("lock", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.LockMechanism).getCharacteristic(Characteristic.LockTargetState)
    thisCharacteristic.on('get', function (callback) {
        switch (that.device.attributes.lock) {
            case 'locked':
                callback(null, Characteristic.LockCurrentState.SECURED);
                break;
            case 'unlocked':
                callback(null, Characteristic.LockCurrentState.UNSECURED);
                break;
            default:
                callback(null, Characteristic.LockCurrentState.UNKNOWN);
                break;
        }
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value === false) {
            value = Characteristic.LockTargetState.UNSECURED;
        } else if (value === true) {
            value = Characteristic.LockTargetState.SECURED;
        }
        switch (value) {
            case Characteristic.LockTargetState.SECURED:
                that.platform.api.runCommand(callback, that.deviceid, "lock");
                that.device.attributes.lock = "locked";
                break;
            case Characteristic.LockTargetState.UNSECURED:
                that.platform.api.runCommand(callback, that.deviceid, "unlock");
                that.device.attributes.lock = "unlocked";
                break;
        }
    });
    that.platform.addAttributeUsage("lock", this.deviceid, thisCharacteristic);

}

if (device.attributes['securityStatus'] !== undefined) {
    that.deviceGroup = "alarm";
    thisCharacteristic = this.getaddService(Service.SecuritySystem).getCharacteristic(Characteristic.SecuritySystemCurrentState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.securityStatus == "stay")
            callback(null, Characteristic.SecuritySystemCurrentState.STAY_ARM);
        else if (that.device.attributes.securityStatus == "away")
            callback(null, Characteristic.SecuritySystemCurrentState.AWAY_ARM);
        else if (that.device.attributes.securityStatus == "night")
            callback(null, Characteristic.SecuritySystemCurrentState.NIGHT_ARM);
        else if (that.device.attributes.securityStatus == "off")
            callback(null, Characteristic.SecuritySystemCurrentState.DISARMED);
        else if (that.device.attributes.securityStatus == "alarm_active")
            callback(null, Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED);
    });
    that.platform.addAttributeUsage("securityStatus", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.SecuritySystem).getCharacteristic(Characteristic.SecuritySystemTargetState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.securityStatus == "stay")
            callback(null, Characteristic.SecuritySystemCurrentState.STAY_ARM);
        else if (that.device.attributes.securityStatus == "away")
            callback(null, Characteristic.SecuritySystemCurrentState.AWAY_ARM);
        else if (that.device.attributes.securityStatus == "night")
            callback(null, Characteristic.SecuritySystemCurrentState.NIGHT_ARM);
        else if (that.device.attributes.securityStatus == "off")
            callback(null, Characteristic.SecuritySystemCurrentState.DISARMED);
        else if (that.device.attributes.securityStatus == "alarm_active")
            callback(null, Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED);
    });
    thisCharacteristic.on('set', function (value, callback) {
        // that.platform.log(that.deviceid + ' set value : ' + value);
        if (value == Characteristic.SecuritySystemCurrentState.STAY_ARM) {
            that.platform.api.runCommand(callback, that.deviceid, "stay");
        } else if (value == Characteristic.SecuritySystemCurrentState.AWAY_ARM) {
            that.platform.api.runCommand(callback, that.deviceid, "away");
        } else if (value == Characteristic.SecuritySystemCurrentState.NIGHT_ARM) {
            that.platform.api.runCommand(callback, that.deviceid, "night");
        } else if (value == Characteristic.SecuritySystemCurrentState.DISARMED) {
            that.platform.api.runCommand(callback, that.deviceid, "off");
        } else if (value == Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED) {
            that.platform.api.runCommand(callback, that.deviceid, "alarm_active");
        }
    });
    that.platform.addAttributeUsage("securityStatus", this.deviceid, thisCharacteristic);
}


if (device.capabilities["Button"] !== undefined) {
    this.deviceGroup = "button";
	thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).getCharacteristic(Characteristic.ProgrammableSwitchEvent)
        	if (that.device.attributes.button == 'pushed')
			thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
		else if (that.device.attributes.button == 'double')
			thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
      	 	 else if (that.device.attributes.button == 'held')
			thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
   	that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);	

/*	
class ESPGESPlugin
{
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
       var switchnamea = this.name + '1'
       var switchnameb = this.name + '2'
       
//    this.num = config.number || '1';
    this.listen_port = config.listen_port || 8265;
	  
	this.informationService = new Service.AccessoryInformation();

    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, "ESP")
      .setCharacteristic(Characteristic.Model, "ESPEasyGesture")
      .setCharacteristic(Characteristic.SerialNumber, this.device);
	  
	this.switch1Service = new Service.StatelessProgrammableSwitch(this.name, switchnamea);
	  
	this.switch2Service = new Service.StatelessProgrammableSwitch(this.name, switchnameb);
    

    this.server = dgram.createSocket('udp4');
    
    this.server.on('error', (err) => {
      console.log(`udp server error:\n${err.stack}`);
      this.server.close();
    });

    this.server.on('message', (msg, rinfo) => {
      console.log(`server received udp: ${msg} from ${rinfo.address}`);

      let json;
      try {
          json = JSON.parse(msg);
      } catch (e) {
          console.log(`failed to decode JSON: ${e}`);
          return;
      }

      const gesture = json.gesture;
	    
	    
//	if (this.num == '1') {
	    	if (gesture == '1') {
        this.switch1Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
		} else if (gesture == '2') {
        this.switch1Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
		} else if (gesture == '3') {
        this.switch1Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
		}
//	} else { 
		else if (gesture == '4') {
        this.switch2Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
		} else if (gesture == '5') {
        this.switch2Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
		} else if (gesture == '6') {
        this.switch2Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
		}
//	}

	    
    });

    
    this.server.bind(this.listen_port);

  }

  getServices() {
	  
//	return [this.informationService, this.switch1Service];
	return [this.informationService, this.switch1Service, this.switch2Service];

  }
}







	thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS) 
        else if (that.device.attributes.button == 'double')
	    thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS) 
        else if (that.device.attributes.button == 'held')
	    thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.LONG_PRESS) 
    that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);

	
	            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.On)
            thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })

//	service.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
//	thisCharacteristic.setValue(actionMap[event.action])
	
	

thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).getCharacteristic(Characteristic.ProgrammableSwitchEvent)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.button == 'pushed')
            callback(null, Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
        else if (that.device.attributes.button == 'double')
            callback(null, Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
        else if (that.device.attributes.button == 'held')
            callback(null, Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
	else
	    callback(null, Characteristic.ProgrammableSwitchEvent);
    });
    that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);
    
    
            thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).getCharacteristic(Characteristic.ProgrammableSwitchEvent);
            thisCharacteristic.on('get', function (callback) {
                switch (that.device.attributes.button) {
                    case "pushed":
                        callback(null, Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                        break;
                    case "double":
                        callback(null, Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
                        break;
                    case "held":
                        callback(null, Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                        break;
                }
            });
            that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);


    thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).getCharacteristic(Characteristic.ProgrammableSwitchEvent)
//        if (that.device.attributes.button == 'pushed')
            thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS, that.device.attributes.button == 'pushed');
//        else if (that.device.attributes.button == 'double')
            thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS, that.device.attributes.button == 'double');
//        else if (that.device.attributes.button == 'held')
            thisCharacteristic.setValue(Characteristic.ProgrammableSwitchEvent.LONG_PRESS, that.device.attributes.button == 'held');
    that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);


	thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).setCharacteristic(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS, that.device.attributes.button == 'pushed')
	thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).setCharacteristic(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS, that.device.attributes.button == 'double')
	thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).setCharacteristic(Characteristic.ProgrammableSwitchEvent.LONG_PRESS, that.device.attributes.button == 'held')
    	that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);


    if (gesture == '1') {
        this.switch1Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
		} else if (gesture == '2') {
        this.switch1Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
		} else if (gesture == '3') {
        this.switch1Service
	.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
     	.setValue(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
		}
    
    
    thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).getCharacteristic(Characteristic.ProgrammableSwitchEvent)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.button == 'pushed')
            callback(null, Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
        if (that.device.attributes.button == 'double')
            callback(null, Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
        if (that.device.attributes.button == 'held')
            callback(null, Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
    });
    that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);
    thisCharacteristic = this.getaddService(Service.StatelessProgrammableSwitch).getCharacteristic(Characteristic.ProgrammableSwitchEvent)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.button == 'held')
            callback(null, Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
    });
    that.platform.addAttributeUsage("button", this.deviceid, thisCharacteristic);
    */
}



if (device.capabilities["Switch"] !== undefined && this.deviceGroup == "unknown") {
    if (device.capabilities["Outlet"] !== undefined) {
        if (device.capabilities["Energy Meter"] !== undefined) {
            this.deviceGroup = "outlet"
            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.On)
            thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })
            thisCharacteristic.on('set', function (value, callback) {
                if (value)
                    that.platform.api.runCommand(callback, that.deviceid, "on");
                else
                    that.platform.api.runCommand(callback, that.deviceid, "off");
            });
            that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);
            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.OutletInUse)
            thisCharacteristic.on('get', function (callback) { callback(null, (that.device.attributes.power > 0)); });
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.Outlet).addCharacteristic(Characteristic.CarbonDioxideLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); })
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.CarbonDioxidePeakLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.energy)); })
            that.platform.addAttributeUsage("energy", this.deviceid, thisCharacteristic);

        }
        else if (device.capabilities["Power Meter"] !== undefined) {
            this.deviceGroup = "outlet"
            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.On)
            thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })
            thisCharacteristic.on('set', function (value, callback) {
                if (value)
                    that.platform.api.runCommand(callback, that.deviceid, "on");
                else
                    that.platform.api.runCommand(callback, that.deviceid, "off");
            });
            that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.OutletInUse)
            thisCharacteristic.on('get', function (callback) { callback(null, (that.device.attributes.power > 0)); });
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.StatusActive)
            thisCharacteristic.on('get', function (callback) { callback(null, (that.device.attributes.power > 0)); });
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.CarbonDioxideLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); })
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
        }
        else {
            this.deviceGroup = "outlet"
            thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(Characteristic.On)
            thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })
            thisCharacteristic.on('set', function (value, callback) {
                if (value)
                    that.platform.api.runCommand(callback, that.deviceid, "on");
                else
                    that.platform.api.runCommand(callback, that.deviceid, "off");
            });
            that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);
        }

    }


    else if (device.capabilities["Valve"] !== undefined) {
        if (device.commands.sprinkler) {
            this.deviceGroup = "valve";
            thisCharacteristic = this.getaddService(Service.Valve).getCharacteristic(Characteristic.ValveType);
            thisCharacteristic.on('get', function (callback) {
                switch (that.device.attributes.valvetype) {
                    case 'Faucet':
                        callback(null, Characteristic.ValveType.WATER_FAUCET);
                        break;
                    case 'ShowerHead':
                        callback(null, Characteristic.ValveType.SHOWER_HEAD);
                        break;
                    case 'GenericValve':
                        callback(null, Characteristic.ValveType.GENERIC_VALVEIRRIGATION);
                        break;
                    case 'Sprinkler':
                    default:
                        callback(null, Characteristic.ValveType.IRRIGATION);
                        break;
                }
            });
            that.platform.addAttributeUsage('valvetype', this.deviceid, thisCharacteristic);
            //Defines Valve State (opened/closed)
            thisCharacteristic = this.getaddService(Service.Valve).getCharacteristic(Characteristic.Active);
            thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })
            thisCharacteristic.on('set', function (value, callback) {
                if (value)
                    that.platform.api.runCommand(callback, that.deviceid, "on");
                else
                    that.platform.api.runCommand(callback, that.deviceid, "off");
            });
            that.platform.addAttributeUsage('switch', this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.Valve).getCharacteristic(Characteristic.InUse);
            thisCharacteristic.on('get', function (callback) {
                callback(null, that.device.attributes.switch == "on");
            });
            that.platform.addAttributeUsage('switch', this.deviceid, thisCharacteristic);
        }
        else {
            this.deviceGroup = "valve";
            thisCharacteristic = this.getaddService(Service.Valve).getCharacteristic(Characteristic.ValveType);
            thisCharacteristic.on('get', function (callback) {
                switch (that.device.attributes.valvetype) {
                    case 'Faucet':
                        callback(null, Characteristic.ValveType.WATER_FAUCET);
                        break;
                    case 'ShowerHead':
                        callback(null, Characteristic.ValveType.SHOWER_HEAD);
                        break;
                    case 'Sprinkler':
                        callback(null, Characteristic.ValveType.IRRIGATION);
                        break;
                    case 'GenericValve':
                    default:
                        callback(null, Characteristic.ValveType.GENERIC_VALVE);
                        break;
                }
            });
            that.platform.addAttributeUsage('valvetype', this.deviceid, thisCharacteristic);
            //Defines Valve State (opened/closed)
            thisCharacteristic = this.getaddService(Service.Valve).getCharacteristic(Characteristic.Active);
            thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })
            thisCharacteristic.on('set', function (value, callback) {
                if (value)
                    that.platform.api.runCommand(callback, that.deviceid, "on");
                else
                    that.platform.api.runCommand(callback, that.deviceid, "off");
            });
            that.platform.addAttributeUsage('switch', this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.Valve).getCharacteristic(Characteristic.InUse);
            thisCharacteristic.on('get', function (callback) {
                callback(null, that.device.attributes.switch == "on");
            });
            that.platform.addAttributeUsage('switch', this.deviceid, thisCharacteristic);
        }


    }

    else {
	    if (device.commands.noSwitch) {
        this.deviceGroup = "noneed";
    }
    else {
        this.deviceGroup = "switch";
        thisCharacteristic = this.getaddService(Service.Switch).getCharacteristic(Characteristic.On)
        thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.switch == "on"); })
        thisCharacteristic.on('set', function (value, callback) {
            if (value)
                that.platform.api.runCommand(callback, that.deviceid, "on");
            else
                that.platform.api.runCommand(callback, that.deviceid, "off");
        });
        that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

        if (device.capabilities["Switch Level"] !== undefined) {
            thisCharacteristic = this.getaddService(Service.Lightbulb).getCharacteristic(Characteristic.Brightness)
            thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
            thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
            that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);
        }
    }
    }
}

if (device.capabilities["Air Quality Sensor"] !== undefined) {
    	
if (device.commands.XiaomiPM25) {
    this.deviceGroup = "detectors";
        thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.AirQuality)
        thisCharacteristic.on('get', function (callback) {
            if (that.device.attributes.fineDustLevel < 5)
                callback(null, Characteristic.AirQuality.EXCELLENT);
            else if (that.device.attributes.fineDustLevel < 10)
                callback(null, Characteristic.AirQuality.GOOD);
            else if (that.device.attributes.fineDustLevel < 30)
                callback(null, Characteristic.AirQuality.FAIR);
            else if (that.device.attributes.fineDustLevel < 100)
                callback(null, Characteristic.AirQuality.INFAIR);
            else if (that.device.attributes.fineDustLevel < 1000)
                callback(null, Characteristic.AirQuality.POOR);
            else
                callback(null, Characteristic.AirQuality.UNKNOWN);
        });
        that.platform.addAttributeUsage("fineDustLevel", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.PM2_5Density)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.fineDustLevel)) });
        that.platform.addAttributeUsage("fineDustLevel", this.deviceid, thisCharacteristic);

    } else {
        this.deviceGroup = "detectors";
        thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.AirQuality)
        thisCharacteristic.on('get', function (callback) {
            if (that.device.attributes.airQuality < 30)
                callback(null, Characteristic.AirQuality.EXCELLENT);
            else if (that.device.attributes.airQuality < 50)
                callback(null, Characteristic.AirQuality.GOOD);
            else if (that.device.attributes.airQuality < 100)
                callback(null, Characteristic.AirQuality.FAIR);
            else if (that.device.attributes.airQuality < 250)
                callback(null, Characteristic.AirQuality.INFAIR);
            else if (that.device.attributes.airQuality < 1000)
                callback(null, Characteristic.AirQuality.POOR);
            else
                callback(null, Characteristic.AirQuality.UNKNOWN);
        });
        that.platform.addAttributeUsage("airQuality", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.StatusActive)
        thisCharacteristic.on('get', function (callback) { callback(null, (that.device.attributes.airQuality > 50)) });
        that.platform.addAttributeUsage("airQuality", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.PM2_5Density)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.fineDustLevel)) });
        that.platform.addAttributeUsage("fineDustLevel", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.PM10Density)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.dustLevel)) });
        that.platform.addAttributeUsage("dustLevel", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.CarbonMonoxideLevel)
        thisCharacteristic.on('get', function (callback) { callback(null, parseFloat(that.device.attributes.co_value)) });
        that.platform.addAttributeUsage("co_value", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.OzoneDensity)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.o3_value)) });
        that.platform.addAttributeUsage("o3_value", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.NitrogenDioxideDensity)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.no2_value)) });
        that.platform.addAttributeUsage("no2_value", this.deviceid, thisCharacteristic);

            thisCharacteristic = this.getaddService(Service.AirQualitySensor).getCharacteristic(Characteristic.SulphurDioxideDensity)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.so2_value)) });
        that.platform.addAttributeUsage("so2_value", this.deviceid, thisCharacteristic);
    }
}

if ((device.capabilities["Smoke Detector"] !== undefined) && (that.device.attributes.smoke)) {
    this.deviceGroup = "detectors";

    thisCharacteristic = this.getaddService(Service.SmokeSensor).getCharacteristic(Characteristic.SmokeDetected)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.smoke == 'clear')
            callback(null, Characteristic.SmokeDetected.SMOKE_NOT_DETECTED);
        else
            callback(null, Characteristic.SmokeDetected.SMOKE_DETECTED);
    });
    that.platform.addAttributeUsage("smoke", this.deviceid, thisCharacteristic);
    if (device.capabilities['Tamper Alert'] !== undefined) {
        thisCharacteristic = that.getaddService(Service.SmokeSensor).getCharacteristic(Characteristic.StatusTampered);
        thisCharacteristic.on('get', function (callback) {
            callback(null, (device.attributes.tamper === 'detected') ? Characteristic.StatusTampered.TAMPERED : Characteristic.StatusTampered.NOT_TAMPERED);
        });
        that.platform.addAttributeUsage('tamper', that.deviceid, thisCharacteristic);
    }
}

if ((device.capabilities["Carbon Monoxide Detector"] !== undefined) && (that.device.attributes.carbonMonoxide)) {
    if (device.capabilities["Air Quality Sensor"]) {
        this.deviceGroup = "noneed";
    }
    else {
        this.deviceGroup = "detectors";

        thisCharacteristic = this.getaddService(Service.CarbonMonoxideSensor).getCharacteristic(Characteristic.CarbonMonoxideDetected)
        thisCharacteristic.on('get', function (callback) {
            if (that.device.attributes.carbonMonoxide == 'clear')
                callback(null, Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL);
            else
                callback(null, Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL);
        });
        that.platform.addAttributeUsage("carbonMonoxide", this.deviceid, thisCharacteristic);
    }
}

if ((device.capabilities["Carbon Dioxide Measurement"] !== undefined) && (that.device.attributes.carbonDioxide)) {
    if (device.capabilities["Air Quality Sensor"]) {
        this.deviceGroup = "noneed";
    }
    else {
        this.deviceGroup = "detectors";
        thisCharacteristic = this.getaddService(Service.CarbonDioxideSensor).getCharacteristic(Characteristic.CarbonDioxideLevel)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.carbonDioxide)); })
        that.platform.addAttributeUsage("carbonDioxide", this.deviceid, thisCharacteristic);

        thisCharacteristic = this.getaddService(Service.CarbonDioxideSensor).getCharacteristic(Characteristic.CarbonDioxideDetected)
        thisCharacteristic.on('get', function (callback) {
            if (!that.device.attributes.carbonDioxideSet) {
                if (that.device.attributes.carbonDioxide < 1200)
                    callback(null, Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL);
                else
                    callback(null, Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL);
            } else {
                if (that.device.attributes.carbonDioxideSet == 'normal')
                    callback(null, Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL);
                else
                    callback(null, Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL);
            }
        });

        that.platform.addAttributeUsage("carbonDioxide", this.deviceid, thisCharacteristic);
        that.platform.addAttributeUsage("carbonDioxideSet", this.deviceid, thisCharacteristic);
    }
}


if (device.capabilities["Motion Sensor"] !== undefined) {
    if (device.commands.aaa) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";

    thisCharacteristic = this.getaddService(Service.MotionSensor).getCharacteristic(Characteristic.MotionDetected)
    thisCharacteristic.on('get', function (callback) { callback(null, (that.device.attributes.motion == "active")); });
    that.platform.addAttributeUsage("motion", this.deviceid, thisCharacteristic);
        
    thisCharacteristic = this.getaddService(Service.MotionSensor).setCharacteristic(Characteristic.Name,  that.device.attributes.testname)
//    getCharacteristic(Characteristic.name)
//    thisCharacteristic.on('get', function (callback) { callback(null, that.device.attributes.testname) });
    that.platform.addAttributeUsage("testname", this.deviceid, thisCharacteristic);    
    }

    else {    
    if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";

    thisCharacteristic = this.getaddService(Service.MotionSensor).getCharacteristic(Characteristic.MotionDetected)
    thisCharacteristic.on('get', function (callback) { callback(null, (that.device.attributes.motion == "active")); });
    that.platform.addAttributeUsage("motion", this.deviceid, thisCharacteristic);
    if (device.capabilities['Tamper Alert'] !== undefined) {
        thisCharacteristic = that.getaddService(Service.MotionSensor).getCharacteristic(Characteristic.StatusTampered);
        thisCharacteristic.on('get', function(callback) {
             callback(null, (device.attributes.tamper === 'detected') ? Characteristic.StatusTampered.TAMPERED : Characteristic.StatusTampered.NOT_TAMPERED);
           });
        that.platform.addAttributeUsage('tamper', that.deviceid, thisCharacteristic);
     }	    
    }
}

if (device.capabilities["Water Sensor"] !== undefined) {
    
    if (device.commands.wfWater) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.LeakSensor).getCharacteristic(Characteristic.LeakDetected)
        thisCharacteristic.on('get', function (callback) {
        var reply = Characteristic.LeakDetected.LEAK_DETECTED;
        if (that.device.attributes.water == "dry") reply = Characteristic.LeakDetected.LEAK_NOT_DETECTED;
        callback(null, reply);
        });
        that.platform.addAttributeUsage("water", this.deviceid, thisCharacteristic);
        thisCharacteristic = this.getaddService(Service.LeakSensor).setCharacteristic(Characteristic.Name,  "비감지")
    }
    else {
    if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
    thisCharacteristic = this.getaddService(Service.LeakSensor).getCharacteristic(Characteristic.LeakDetected)
    thisCharacteristic.on('get', function (callback) {
        var reply = Characteristic.LeakDetected.LEAK_DETECTED;
        if (that.device.attributes.water == "dry") reply = Characteristic.LeakDetected.LEAK_NOT_DETECTED;
        callback(null, reply);
    });
    that.platform.addAttributeUsage("water", this.deviceid, thisCharacteristic);
    }
}

if (device.capabilities["Presence Sensor"] !== undefined) {
    if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";

    thisCharacteristic = this.getaddService(Service.OccupancySensor).getCharacteristic(Characteristic.OccupancyDetected)
    thisCharacteristic.on('get', function (callback) { callback(null, (that.device.attributes.presence == "present")); });
    that.platform.addAttributeUsage("presence", this.deviceid, thisCharacteristic);
}

if (device.capabilities["Relative Humidity Measurement"] !== undefined) {

    if (device.commands.noHumi) {
        this.deviceGroup = "noneed";
    }
    else if (device.commands.wfHumi) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.HumiditySensor).getCharacteristic(Characteristic.CurrentRelativeHumidity)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.humidity)); });
        that.platform.addAttributeUsage("humidity", this.deviceid, thisCharacteristic);        
        thisCharacteristic = this.getaddService(Service.HumiditySensor).setCharacteristic(Characteristic.Name,  "웨더 습도")
    }
    else {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.HumiditySensor).getCharacteristic(Characteristic.CurrentRelativeHumidity)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.humidity)); });
        that.platform.addAttributeUsage("humidity", this.deviceid, thisCharacteristic);
    }
}

if (device.capabilities["Illuminance Measurement"] !== undefined) {
    
    if (device.commands.LightSensor) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.LightSensor).getCharacteristic(Characteristic.CurrentAmbientLightLevel)
        thisCharacteristic.on('get', function (callback) { callback(null, parseFloat(that.device.attributes.Light)); });
        that.platform.addAttributeUsage("Light", this.deviceid, thisCharacteristic);
    }
    else if (device.commands.wfLux) {
/*        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.LightSensor).getCharacteristic(Characteristic.CurrentAmbientLightLevel)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.illuminance)); });
        that.platform.addAttributeUsage("illuminance", this.deviceid, thisCharacteristic)        

        thisCharacteristic = this.getaddService(Service.MotionSensor).setCharacteristic(Characteristic.Name,  "웨더 조도")
        */
    }
    else {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.LightSensor).getCharacteristic(Characteristic.CurrentAmbientLightLevel)
        thisCharacteristic.on('get', function (callback) { callback(null, parseFloat(that.device.attributes.illuminance)); });
        that.platform.addAttributeUsage("illuminance", this.deviceid, thisCharacteristic);
    }
}

if (device.commands.wfUV) {
    /*
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.LightSensor).getCharacteristic(Characteristic.CurrentAmbientLightLevel)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.ultravioletIndex)); });
        that.platform.addAttributeUsage("ultravioletIndex", this.deviceid, thisCharacteristic)        

        thisCharacteristic = this.getaddService(Service.MotionSensor).setCharacteristic(Characteristic.Name,  "웨더 자외선")
        */
    }    
if (device.commands.wfWind) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.LightSensor).getCharacteristic(Characteristic.CurrentAmbientLightLevel)
        thisCharacteristic.on('get', function (callback) { callback(null, parseFloat(that.device.attributes.wind_gust)); });
        that.platform.addAttributeUsage("wind_gust", this.deviceid, thisCharacteristic)        

        thisCharacteristic = this.getaddService(Service.LightSensor).setCharacteristic(Characteristic.Name,  that.device.attributes.wind_direction)
//        that.platform.addAttributeUsage("wind_direction", this.deviceid, thisCharacteristic);    
    }     
if (device.capabilities["Temperature Measurement"] !== undefined) {
    
    if (device.commands.noTemp) {
        this.deviceGroup = "noneed";
    }
    else if (device.commands.wfTemp) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        thisCharacteristic = this.getaddService(Service.TemperatureSensor).getCharacteristic(Characteristic.CurrentTemperature).setProps({ minValue: -20 })
        thisCharacteristic.on('get', function (callback) {
            if (that.platform.temperature_unit == 'C')
                callback(null, parseFloat(that.device.attributes.temperature));
            else
                callback(null, Math.round(((that.device.attributes.temperature - 32) / 1.8) * 10) / 10);
        });
        that.platform.addAttributeUsage("temperature", this.deviceid, thisCharacteristic);      
        
        thisCharacteristic = this.getaddService(Service.TemperatureSensor).setCharacteristic(Characteristic.Name,  "웨더 온도")        
    }
    else {
    if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
    thisCharacteristic = this.getaddService(Service.TemperatureSensor).getCharacteristic(Characteristic.CurrentTemperature).setProps({ minValue: -20 })
    thisCharacteristic.on('get', function (callback) {
        if (that.platform.temperature_unit == 'C')
            callback(null, parseFloat(that.device.attributes.temperature));
        else
            callback(null, Math.round(((that.device.attributes.temperature - 32) / 1.8) * 10) / 10);
    });
    that.platform.addAttributeUsage("temperature", this.deviceid, thisCharacteristic);
    }
}


if (device.capabilities["Contact Sensor"] !== undefined) {
    if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
    thisCharacteristic = this.getaddService(Service.ContactSensor).getCharacteristic(Characteristic.ContactSensorState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.contact == "closed")
            callback(null, Characteristic.ContactSensorState.CONTACT_DETECTED);
        else
            callback(null, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);

    });
    that.platform.addAttributeUsage("contact", this.deviceid, thisCharacteristic);
    if (device.capabilities['Tamper Alert'] !== undefined) {
        thisCharacteristic = that.getaddService(Service.ContactSensor).getCharacteristic(Characteristic.StatusTampered);
        thisCharacteristic.on('get', function(callback) {
             callback(null, (device.attributes.tamper === 'detected') ? Characteristic.StatusTampered.TAMPERED : Characteristic.StatusTampered.NOT_TAMPERED);
           });
        that.platform.addAttributeUsage('tamper', that.deviceid, thisCharacteristic);
     }
	if (device.capabilities['Three Axis'] !== undefined) {
        thisCharacteristic = that.getaddService(Service.ContactSensor).getCharacteristic(Characteristic.StatusTampered);
        thisCharacteristic.on('get', function(callback) {
             callback(null, (device.attributes.acceleration === 'active') ? Characteristic.StatusTampered.TAMPERED : Characteristic.StatusTampered.NOT_TAMPERED);
           });
        that.platform.addAttributeUsage('acceleration', that.deviceid, thisCharacteristic);
     }
}

if (device.capabilities["Battery"] !== undefined) {
	if (device.capabilities["Power Source"] !== undefined) {
    thisCharacteristic = this.getaddService(Service.BatteryService).getCharacteristic(Characteristic.BatteryLevel)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.battery)); });
    that.platform.addAttributeUsage("battery", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.BatteryService).getCharacteristic(Characteristic.StatusLowBattery)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.battery < 20)
            callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
        else
            callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
    });
    that.platform.addAttributeUsage("battery", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.BatteryService).getCharacteristic(Characteristic.ChargingState)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.powerSource == 'dc')
            callback(null, Characteristic.ChargingState.CHARGING);
        else if (that.device.attributes.powerSource == 'unknown')
            callback(null, Characteristic.ChargingState.NOT_CHARGABLE);
        else
            callback(null, Characteristic.ChargingState.NOT_CHARGING);
    });
    that.platform.addAttributeUsage("powerSource", this.deviceid, thisCharacteristic);
    
    }
	else {
    thisCharacteristic = this.getaddService(Service.BatteryService).getCharacteristic(Characteristic.BatteryLevel)
    thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.battery)); });
    that.platform.addAttributeUsage("battery", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.BatteryService).getCharacteristic(Characteristic.StatusLowBattery)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.battery < 20)
            callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
        else
            callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
    });
    that.platform.addAttributeUsage("battery", this.deviceid, thisCharacteristic);		
	}	
}

if (device.capabilities["Energy Meter"] !== undefined) {
    if (device.commands.energy) {
        if (device.commands.power) {
            this.deviceGroup = 'EnergyMeter';
        }
        else {
            if (this.deviceGroup == 'unknown') this.deviceGroup = "Energy Meter";
            thisCharacteristic = this.getaddService(Service.LightSensor).getCharacteristic(Characteristic.CurrentAmbientLightLevel)
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); })
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
            thisCharacteristic = this.getaddService(Service.LightSensor).addCharacteristic(Characteristic.CarbonDioxideLevel).setProps({ unit: "W", });
            thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); });
            that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
            thisCharacteristic = this.getaddService(Service.LightSensor).addCharacteristic(Characteristic.CarbonDioxidePeakLevel).setProps({ unit: "KWh", });
            format: Characteristic.Formats.FLOAT,
                thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.energy)); });
            that.platform.addAttributeUsage("energy", this.deviceid, thisCharacteristic);

        }
    }
    else {
        this.deviceGroup = 'EnergyMeter';
        thisCharacteristic = this.getaddService(Service.Outlet).getCharacteristic(EnergyCharacteristics.CurrentConsumption1)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.energy)); });
        that.platform.addAttributeUsage("energy", this.deviceid, thisCharacteristic);
    }
}



if (device.capabilities["Acceleration Sensor"] !== undefined) {
    if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
}

if (device.capabilities["Three Axis"] !== undefined) {
    if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
}

if (device.capabilities["Thermostat"] !== undefined) {
if (device.commands.cooler) {
    this.deviceGroup = "thermostats";

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.Active)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "on")
            callback(null, Characteristic.Active.ACTIVE);
        else
            callback(null, Characteristic.Active.INACTIVE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "on");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.CurrentHeaterCoolerState).setProps({ validValues: [0, 1, 3] });
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.switch == "off") 
            callback(null, Characteristic.CurrentHeaterCoolerState.INACTIVE);
        else if (that.device.attributes.switch == "on" && that.device.attributes.power <= 50)
            callback(null, Characteristic.CurrentHeaterCoolerState.IDLE);
        else if (that.device.attributes.switch == "on" && that.device.attributes.power >= 51)
            callback(null, Characteristic.CurrentHeaterCoolerState.COOLING);
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);
    that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);
 
    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.TargetHeaterCoolerState).setProps({ validValues: [2] });
    thisCharacteristic.on('get', function (callback) {
        switch (that.device.attributes.switch) {
            case "on":
                callback(null, Characteristic.TargetHeaterCoolerState.COOL);
                break;
            default: //The above list should be inclusive, but we need to return something if they change stuff.
                callback(null, Characteristic.TargetHeaterCoolerState.OFF);
                break;
        }
    })
    thisCharacteristic.on('set', function (value, callback) {
        switch (value) {
            case Characteristic.TargetHeaterCoolerState.COOL:
            that.platform.api.runCommand(callback, that.deviceid, "on");
                break;
            case Characteristic.TargetHeaterCoolerState.OFF:
                that.platform.api.runCommand(callback, that.deviceid, "off");
                break;
        }
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.CurrentTemperature)
    thisCharacteristic.on('get', function (callback) {
        if (that.platform.temperature_unit == 'C')
            callback(null, parseFloat(that.device.attributes.temperature * 10) / 10);
        else
            callback(null, Math.round(((that.device.attributes.temperature - 32) / 1.8) * 10) / 10);
    });
    that.platform.addAttributeUsage("temperature", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.CoolingThresholdTemperature).setProps({ minValue: 18, maxValue: 30 });
    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.level)); });
    thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
    that.platform.addAttributeUsage("level", this.deviceid, thisCharacteristic);
	
	thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.CarbonDioxideLevel)
     	thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.power)); })
        that.platform.addAttributeUsage("power", this.deviceid, thisCharacteristic);

}
else if (device.commands.Xiaomiheater) {
    this.deviceGroup = "thermostats";

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.Active)
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.thermostatMode == "heat")
            callback(null, Characteristic.Active.ACTIVE);
        else
            callback(null, Characteristic.Active.INACTIVE);
    });
    thisCharacteristic.on('set', function (value, callback) {
        if (value)
            that.platform.api.runCommand(callback, that.deviceid, "heat");
        else
            that.platform.api.runCommand(callback, that.deviceid, "off");
    });
    that.platform.addAttributeUsage("thermostatMode", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.CurrentHeaterCoolerState).setProps({ validValues: [0, 1, 2] });
    thisCharacteristic.on('get', function (callback) {
        if (that.device.attributes.thermostatMode == "off") 
            callback(null, Characteristic.CurrentHeaterCoolerState.INACTIVE);
        else if (that.device.attributes.thermostatMode == "heat" && that.device.attributes.thermostatOperatingState == "heating")
            callback(null, Characteristic.CurrentHeaterCoolerState.IDLE);
        else if (that.device.attributes.thermostatMode == "heat" && that.device.attributes.thermostatOperatingState == "idle")
            callback(null, Characteristic.CurrentHeaterCoolerState.HEATING);
    });
    that.platform.addAttributeUsage("thermostatMode", this.deviceid, thisCharacteristic);
    that.platform.addAttributeUsage("thermostatOperatingState", this.deviceid, thisCharacteristic);
 
    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.TargetHeaterCoolerState).setProps({ validValues: [1] });
    thisCharacteristic.on('get', function (callback) {
        switch (that.device.attributes.thermostatMode) {
            case "heat":
                callback(null, Characteristic.TargetHeaterCoolerState.HEAT);
                break;
            default: //The above list should be inclusive, but we need to return something if they change stuff.
                callback(null, Characteristic.TargetHeaterCoolerState.OFF);
                break;
        }
    })
    thisCharacteristic.on('set', function (value, callback) {
        switch (value) {
            case Characteristic.TargetHeaterCoolerState.HEAT:
            that.platform.api.runCommand(callback, that.deviceid, "heat");
                break;
            case Characteristic.TargetHeaterCoolerState.OFF:
                that.platform.api.runCommand(callback, that.deviceid, "off");
                break;
        }
    });
    that.platform.addAttributeUsage("switch", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.CurrentTemperature)
    thisCharacteristic.on('get', function (callback) {
        if (that.platform.temperature_unit == 'C')
            callback(null, parseFloat(that.device.attributes.temperature * 10) / 10);
        else
            callback(null, Math.round(((that.device.attributes.temperature - 32) / 1.8) * 10) / 10);
    });
    that.platform.addAttributeUsage("temperature", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.HeatingThresholdTemperature).setProps({ minValue: 16, maxValue: 32 });
    thisCharacteristic.on('get', function (callback) { callback(null, parseInt(that.device.attributes.heatingSetpoint)); });
    thisCharacteristic.on('set', function (value, callback) { that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value }); });
    that.platform.addAttributeUsage("heatingSetpoint", this.deviceid, thisCharacteristic);
	
	thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.CurrentRelativeHumidity)
        thisCharacteristic.on('get', function (callback) { callback(null, Math.round(that.device.attributes.humidity)); });
        that.platform.addAttributeUsage("humidity", this.deviceid, thisCharacteristic);
	
	thisCharacteristic = this.getaddService(Service.HeaterCooler).getCharacteristic(Characteristic.LockPhysicalControls)
    	thisCharacteristic.on('get', function (callback) {
        	if (that.device.attributes.childlock == 'on')
            		callback(null, Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED);
        	else if (that.device.attributes.childlock == 'off')
            		callback(null, Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED);
    	});
    	thisCharacteristic.on('set', function (value, callback) {
        	if (value == Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED) {
            		that.platform.api.runCommand(callback, that.deviceid, "childLockOn");
            		that.device.attributes.childlock = "on";
        	} else if (value == Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED) {
            		that.platform.api.runCommand(callback, that.deviceid, "childLockOff");
            		that.device.attributes.childlock = "off";
       	 	}
    	});
    	that.platform.addAttributeUsage("door", this.deviceid, thisCharacteristic);


}
else {	
	
    this.deviceGroup = "thermostats";

    thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.CurrentHeatingCoolingState)
    thisCharacteristic.on('get', function (callback) {
        switch (that.device.attributes.thermostatOperatingState) {
            case "pending cool":
            case "cooling":
                callback(null, Characteristic.CurrentHeatingCoolingState.COOL);
                break;
            case "pending heat":
            case "heating":
                callback(null, Characteristic.CurrentHeatingCoolingState.HEAT);
                break;
            default: //The above list should be inclusive, but we need to return something if they change stuff.
                //TODO: Double check if Smartthings can send "auto" as operatingstate. I don't think it can.
                callback(null, Characteristic.CurrentHeatingCoolingState.OFF);
                break;
        }
    });
    that.platform.addAttributeUsage("thermostatOperatingState", this.deviceid, thisCharacteristic);

    //Handle the Target State
    thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.TargetHeatingCoolingState)
    thisCharacteristic.on('get', function (callback) {
        switch (that.device.attributes.thermostatMode) {
            case "cool":
                callback(null, Characteristic.TargetHeatingCoolingState.COOL);
                break;
            case "emergency heat":
            case "heat":
                callback(null, Characteristic.TargetHeatingCoolingState.HEAT);
                break;
            case "auto":
                callback(null, Characteristic.TargetHeatingCoolingState.AUTO);
                break;
            default: //The above list should be inclusive, but we need to return something if they change stuff.
                callback(null, Characteristic.TargetHeatingCoolingState.OFF);
                break;
        }
    })
    thisCharacteristic.on('set', function (value, callback) {
        switch (value) {
            case Characteristic.TargetHeatingCoolingState.COOL:
                that.platform.api.runCommand(callback, that.deviceid, "cool");
                that.device.attributes.thermostatMode = 'cool';
                break;
            case Characteristic.TargetHeatingCoolingState.HEAT:
                that.platform.api.runCommand(callback, that.deviceid, "heat");
                that.device.attributes.thermostatMode = 'heat';
                break;
            case Characteristic.TargetHeatingCoolingState.AUTO:
                that.platform.api.runCommand(callback, that.deviceid, "auto");
                that.device.attributes.thermostatMode = 'auto';
                break;
            case Characteristic.TargetHeatingCoolingState.OFF:
                that.platform.api.runCommand(callback, that.deviceid, "off");
                that.device.attributes.thermostatMode = 'off';
                break;
        }
    });
    that.platform.addAttributeUsage("thermostatMode", this.deviceid, thisCharacteristic);

    if (device.capabilities["Relative Humidity Measurement"] !== undefined) {
        thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.CurrentRelativeHumidity)
        thisCharacteristic.on('get', function (callback) {
            callback(null, parseInt(that.device.attributes.humidity));
        });
        that.platform.addAttributeUsage("humidity", this.deviceid, thisCharacteristic);
    }

    thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.CurrentTemperature)
    thisCharacteristic.on('get', function (callback) {
        if (that.platform.temperature_unit == 'C')
            callback(null, Math.round(that.device.attributes.temperature * 10) / 10);
        else
            callback(null, Math.round(((that.device.attributes.temperature - 32) / 1.8) * 10) / 10);
    });
    that.platform.addAttributeUsage("temperature", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.TargetTemperature)
    thisCharacteristic.on('get', function (callback) {
        var temp = undefined;
        switch (that.device.attributes.thermostatMode) {
            case "cool":
                temp = that.device.attributes.coolingSetpoint;
                break;
            case "emergency heat":
            case "heat":
                temp = that.device.attributes.heatingSetpoint;
                break;
            default: //This should only refer to auto
                // Choose closest target as single target
                var high = that.device.attributes.coolingSetpoint;
                var low = that.device.attributes.heatingSetpoint;
                var cur = that.device.attributes.temperature;
                temp = Math.abs(high - cur) < Math.abs(cur - low) ? high : low;
                break;
        }
        if (!temp)
            callback('Unknown');
        else if (that.platform.temperature_unit == 'C')
            callback(null, Math.round(temp * 10) / 10);
        else
            callback(null, Math.round(((temp - 32) / 1.8) * 10) / 10);
    })
    thisCharacteristic.on('set', function (value, callback) {
        //Convert the Celsius value to the appropriate unit for Smartthings
        var temp = value;
        if (that.platform.temperature_unit == 'C')
            temp = value;
        else
            temp = ((value * 1.8) + 32);

        //Set the appropriate temperature unit based on the mode
        switch (that.device.attributes.thermostatMode) {
            case "cool":
                that.platform.api.runCommand(callback, that.deviceid, "setCoolingSetpoint", {
                    value1: temp
                });
                that.device.attributes.coolingSetpoint = temp;
                break;
            case "emergency heat":
            case "heat":
                that.platform.api.runCommand(callback, that.deviceid, "setHeatingSetpoint", {
                    value1: temp
                });
                that.device.attributes.heatingSetpoint = temp;
                break;
            default: //This should only refer to auto
                // Choose closest target as single target
                var high = that.device.attributes.coolingSetpoint;
                var low = that.device.attributes.heatingSetpoint;
                var cur = that.device.attributes.temperature;
                var isHighTemp = Math.abs(high - cur) < Math.abs(cur - low);
                if (isHighTemp) {
                    that.platform.api.runCommand(callback, that.deviceid, "setCoolingSetpoint", { value1: temp });
                } else {
                    that.platform.api.runCommand(null, that.deviceid, "setHeatingSetpoint", { value1: temp });
                }
                break;
        }
    });
    that.platform.addAttributeUsage("thermostatMode", this.deviceid, thisCharacteristic);
    that.platform.addAttributeUsage("coolingSetpoint", this.deviceid, thisCharacteristic);
    that.platform.addAttributeUsage("heatingSetpoint", this.deviceid, thisCharacteristic);
    that.platform.addAttributeUsage("temperature", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.TemperatureDisplayUnits)
    thisCharacteristic.on('get', function (callback) {
        if (platform.temperature_unit == "C")
            callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS);
        else
            callback(null, Characteristic.TemperatureDisplayUnits.FAHRENHEIT);
    });
    //that.platform.addAttributeUsage("temperature_unit", "platform", thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.HeatingThresholdTemperature)
    thisCharacteristic.on('get', function (callback) {
        if (that.platform.temperature_unit == 'C')
            callback(null, Math.round(that.device.attributes.heatingSetpoint * 10) / 10);
        else
            callback(null, Math.round(((that.device.attributes.heatingSetpoint - 32) / 1.8) * 10) / 10);
    })
    thisCharacteristic.on('set', function (value, callback) {
        //Convert the Celsius value to the appropriate unit for Smartthings
        var temp = value;
        if (that.platform.temperature_unit == 'C')
            temp = value;
        else
            temp = ((value * 1.8) + 32);
        that.platform.api.runCommand(callback, that.deviceid, "setHeatingSetpoint", {
            value1: temp
        });
        that.device.attributes.heatingSetpoint = temp;
    });
    that.platform.addAttributeUsage("heatingSetpoint", this.deviceid, thisCharacteristic);

    thisCharacteristic = this.getaddService(Service.Thermostat).getCharacteristic(Characteristic.CoolingThresholdTemperature)
    thisCharacteristic.on('get', function (callback) {
        if (that.platform.temperature_unit == 'C')
            callback(null, Math.round((that.device.attributes.coolingSetpoint * 10)) / 10);
        else
            callback(null, Math.round(((that.device.attributes.coolingSetpoint - 32) / 1.8) * 10) / 10);
    });
    thisCharacteristic.on('set', function (value, callback) {
        //Convert the Celsius value to the appropriate unit for Smartthings
        var temp = value;
        if (that.platform.temperature_unit == 'C')
            temp = value;
        else
            temp = ((value * 1.8) + 32);
        that.platform.api.runCommand(callback, that.deviceid, "setCoolingSetpoint", {
            value1: temp
        });
        that.device.attributes.coolingSetpoint = temp;
    });
    that.platform.addAttributeUsage("coolingSetpoint", this.deviceid, thisCharacteristic);
}
}
this.loadData(device, this);
}


function loadData(data, myObject) {
    var that = this;
    if (myObject !== undefined) that = myObject;
    if (data !== undefined) {
        this.device = data;
        for (var i = 0; i < that.services.length; i++) {
            for (var j = 0; j < that.services[i].characteristics.length; j++) {
                that.services[i].characteristics[j].getValue();
            }
        }
    } else {
        this.log.debug("Fetching Device Data")
        this.platform.api.getDevice(this.deviceid, function (data) {
            if (data === undefined) return;
            this.device = data;
            for (var i = 0; i < that.services.length; i++) {
                for (var j = 0; j < that.services[i].characteristics.length; j++) {
                    that.services[i].characteristics[j].getValue();
                }
            }
        });
    }
}


function getServices() {
    return this.services;
}

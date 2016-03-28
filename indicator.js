const GLib = imports.gi.GLib;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const GnomeDesktop = imports.gi.GnomeDesktop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Timezone = Me.imports.timezone;
const Avatar = Me.imports.avatar;

const TimezoneIndicator = new Lang.Class({
    Name: 'TimezoneIndicator',
    Extends: PanelMenu.Button,

    _init: function(){
    this.parent(0.5, _("Timezone Indicator"));

    this._timezones = [];

    this._icon = new St.Icon({ icon_name: 'gnome-clocks-symbolic', style_class: 'system-status-icon' });
    this.actor.add_actor(this._icon);

    Main.panel.menuManager.addMenu(this.menu);
    this._item = new PopupMenu.PopupBaseMenuItem({reactive: false});
    this.menu.addMenuItem(this._item);

    this._createUI();

    this._clock = new GnomeDesktop.WallClock();
    this._clock.connect('notify::clock', Lang.bind(this, this._updateTimezones));
    this._updateTimezones();
    },

    _updateTimezones: function() {
        this._timezones.forEach(function (timezone) {
            let time = GLib.DateTime.new_now(timezone.tz);
            timezone.label.text = time.format('%H:%M');
        });
    },

    _createUI: function() {
        let timezones = Timezone.getTimezones();
        let mainBox = new St.BoxLayout({style_class: 'tz1-people-box'});

        if (timezones.error) {
            mainBox.add(new St.Label({text: timezones.error}));
        } else {
            timezones.forEach(Lang.bind(this, function(tz) {
                let tzBox = new St.BoxLayout({vertical: true, width: 70});
                mainBox.add(tzBox);
                let timeLabel = new St.Label({style_class: 'tzi-time-label'});
                if (tz.sameAsSystem)
                    timeLabel.style_class += ' tzi-time-label-system';
                this._timezones.push({tz: tz.tz1, label: timeLabel});

                tzBox.add(timeLabel, {x_align: St.Align.START, x_fill: false});
                tzBox.add(new St.Label({text: tz.topCity.toUpperCase(), style_class: 'tzi-tz-topCity'}));
                tzBox.add(new St.Label({text: tz.niceOffset, style_class: 'tzi-tz-offset'}));

                tz.people.forEach(function(person) {
                  let iconBin = new St.Bin();
                  let avatar = new Avatar.Avatar(person);
                  iconBin.child = avatar.actor;
                  tzBox.add(iconBin, {x_align: St.Align.START, x_fill: false});
                });
            }));
        }

        this._item.actor.add_actor(mainBox);
    }
});


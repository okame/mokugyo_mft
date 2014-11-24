/**
 * @fileOverview hoge
 */

// Namespace
var MKG = MKG || {};

(function($, d, ns){
    'use strict';

    /* ---------------------------------
     * Config
     * --------------------------------- */
    var c = {
        BITRATE: 9600,
        MIC_TH: 500,
        CNT_KEY: 'mokugyo_cnt'
    };

    /* ---------------------------------
     * Alias
     * --------------------------------- */
    /* ---------------------------------
     * Private
     * --------------------------------- */
    /* ---------------------------------
     * Public
     * --------------------------------- */

    /**
     * @constructor
     */
    var arduino = {

        initialize: function() {
            console.log('initializing arduino obj...');

            var self = this;

            this.$ports = $('#portSelect');
            this.$btnConnect = $('#btnConnect');
            this.$btnConnect.click($.proxy(this.handleClickBtnConnect, this));
            this.$btnHit = $('#btnHit');
            this.$btnHit.click($.proxy(this.handleClickBtnHit, this));
            this.$btnReset = $('#btnReset');
            this.$btnReset.click($.proxy(this.handleClickBtnReset, this));
            this.$btnDisConnect = $('#btnDisConnect');
            this.$btnDisConnect.click($.proxy(this.handleClickBtnDisConnect, this));
            this.$cnt = $('#cnt');
            chrome.storage.local.get(c.CNT_KEY, function(data) {
                self.cnt = data[c.CNT_KEY] || 0;
                self.$cnt.html(self.cnt);
            });

            this.templatePortSelect = $('#tmplPortSelect').html();
            this.fetchDevices().done(function() {
                self.renderPorts();
            });
            this.serial_data_text = '';

        },

        updateCnt: function() {
            var data = {};
            this.cnt++;
            this.$cnt.html(this.cnt);
            data[c.CNT_KEY] = this.cnt;
            chrome.storage.local.set(data);
        },

        handleClickBtnReset: function() {
            this.cnt = -1;
            this.updateCnt();
        },

        handleClickBtnHit: function() {
            this.updateCnt();
        },

        handleClickBtnDisConnect: function() {
            if(this.cid) {
                chrome.serial.disconnect(this.cid, function(disconnected) {
                    if(disconnected) {
                        $('#labelConnect').html('dis connected.');
                    }
                });
            }
        },

        handleClickBtnConnect: function() {
            console.log('connect start.');
            var port =  this.$ports.val(), self = this;

            // データ受信
            chrome.serial.onReceive.addListener(function(res) {
                var data = new Uint8Array(res.data), i;
                for(i=0;i<data.length;i++) {
                    if(data[i] !== 13) self.serial_data_text += String.fromCharCode(data[i]);
                }

                self.checkResponse();
            });

            // エラー受信
            chrome.serial.onReceiveError.addListener(function(error) {
                console.log(error);
            });

            // 接続
            this.open(port).done(function() {
                $('#labelConnect').html('connected.');
            });
        },

        checkResponse: function() {
            var text_data, tmp; 
            if(this.serial_data_text.indexOf("\n") != -1) {
                tmp = this.serial_data_text.split("\n");
                text_data = tmp[0];
                this.serial_data_text = tmp[1];
                this.analyzeSensorData(text_data);
            }
        },

        analyzeSensorData: function(text_data) {
            var d = text_data.split('@'),
                mic = d[3];

            //console.log(gx, gy, mic);

            if(mic > 300) {
                console.log(mic);
            }
            if(mic > c.MIC_TH) {
                console.log(mic);
                this.updateCnt();
            }

        },

        fetchDevices: function() {
            var dfd = $.Deferred(),
                self = this;

            chrome.serial.getDevices(function(devices) {
                self.devices = devices;
                dfd.resolve();
            });

            return dfd;
        },

        renderPorts: function() {
            var self = this;

            _.each(this.devices, function(device) {
                var html = self.templatePortSelect.replace(/{{port}}/g, device.path);
                self.$ports.prepend(html);
            });
        },

        open: function(port_name) {
            var self = this,
                dfd = $.Deferred();
            chrome.serial.connect(port_name, {bitrate: c.BITRATE}, function(info) {
                self.cid = info.connectionId;
                console.log('connection id:' + self.cid);
                dfd.resolve();
            });

            return dfd;
        },

    };

    // Export
    ns.arduino = arduino;

})(jQuery, document, MKG);

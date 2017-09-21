var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GBPlugin = /** @class */ (function () {
    function GBPlugin() {
        this.counter = 0;
        this.counterInterval = 30;
    }
    GBPlugin.prototype.canRun = function () {
        this.counter++;
        if (this.counter > this.counterInterval) {
            this.counter = 0;
            return true;
        }
        return false;
    };
    GBPlugin.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
    };
    return GBPlugin;
}());
var GBPluginScheduler = /** @class */ (function () {
    function GBPluginScheduler() {
        this.pluginsRun = [];
        this.pluginsStart = [];
    }
    GBPluginScheduler.GetInstance = function () {
        return this.Instance;
    };
    GBPluginScheduler.prototype.run = function (emulator) {
        this.pluginsRun.forEach(function (plugin) {
            //console.log("Running "+(<any>plugin.constructor).name);
            plugin.run(emulator);
        });
    };
    GBPluginScheduler.prototype.start = function (emulator) {
        console.log("START");
        this.pluginsStart.forEach(function (plugin) {
            console.log("Running " + plugin.constructor.name);
            plugin.run(emulator);
        });
    };
    GBPluginScheduler.prototype.registerPluginRun = function (plugin) {
        this.pluginsRun.push(plugin);
    };
    GBPluginScheduler.prototype.registerPluginStart = function (plugin) {
        this.pluginsStart.push(plugin);
    };
    GBPluginScheduler.Instance = new GBPluginScheduler();
    return GBPluginScheduler;
}());
// Exportation
window.GBPluginScheduler = GBPluginScheduler;
/// <reference path="GBPluginScheduler.ts" />
var NPC = /** @class */ (function () {
    function NPC() {
        this.OBJECT_SPRITE = 0x3C;
        this.OBJECT_MAP_OBJECT_INDEX = 0x00;
        this.OBJECT_SPRITE_TILE = 0x60;
        this.OBJECT_MOVEMENTTYPE = 0x03; //0: regard direction, 1 : rien, 2 : marche libre ,3: turn, 4: Marche aléatoire verticale, 5: marcher r4 H, 6: retour position originale
        this.OBJECT_FLAGS1 = 0x00;
        this.OBJECT_FLAGS2 = 0x00;
        this.OBJECT_PALETTE = 0x01;
        this.OBJECT_DIRECTION_WALKING = 0x00; // 01 -> haut , 00 ->  bas , 10 -> gauche, 11 -> droite
        this.OBJECT_FACING = 0x00; //0: bas, 8: gauche , 0x0C: droite, 4: haut
        this.OBJECT_STEP_TYPE = 0x03; // 3: wait, 1: turn, 7: walk
        this.OBJECT_STEP_DURATION = 0x00;
        this.OBJECT_ACTION = 0x00; //1: rien, 2: walk, 3: run, 4: turn
        this.OBJECT_STEP_FRAME = 0x00;
        this.OBJECT_FACING_STEP = 0x00;
        this.OBJECT_NEXT_TILE = 0x00;
        this.OBJECT_STANDING_TILE = 0x00;
        this.OBJECT_NEXT_MAP_X = 0x0A;
        this.OBJECT_NEXT_MAP_Y = 0x0A;
        this.OBJECT_MAP_X = 0x0A;
        this.OBJECT_MAP_Y = 0x0A;
        this.OBJECT_INIT_X = 0x0A;
        this.OBJECT_INIT_Y = 0x0A;
        this.OBJECT_RADIUS = 0x00;
        this.OBJECT_SPRITE_X = 0x0A;
        this.OBJECT_SPRITE_Y = 0x0A;
        this.OBJECT_SPRITE_X_OFFSET = 0;
        this.OBJECT_SPRITE_Y_OFFSET = 0;
        this.OBJECT_MOVEMENT_BYTE_INDEX = 0;
        this.u1 = 0;
        this.u2 = 0;
        this.u3 = 0;
        this.u4 = 0;
        this.OBJECT_RANGE = 0;
    }
    return NPC;
}());
var NPCWatcher = /** @class */ (function () {
    function NPCWatcher(emulator, slot, npc) {
        this.mustUpdate = false;
        this.valuesToUpdate = [];
        this.created = false;
        this.npc = npc;
        this.slot = slot;
        this.emulator = emulator;
        this.mustUpdate = true;
        for (var i = 0; i < Object.keys(this.npc).length; i++) {
            this.valuesToUpdate[Object.keys(this.npc)[i]] = true;
        }
    }
    NPCWatcher.prototype.set = function (property, value) {
        this.npc[property] = value;
        this.valuesToUpdate[property] = true;
        this.mustUpdate = true;
    };
    NPCWatcher.prototype.walk = function (direction) {
        this.set("OBJECT_MOVEMENTTYPE", 0x0b);
        this.set("OBJECT_STEP_DURATION", 16);
        this.set("OBJECT_NEXT_TILE", 0);
        this.set("OBJECT_ACTION", 2);
        this.set("OBJECT_STEP_TYPE", 7);
        this.set("OBJECT_MAP_OBJECT_INDEX", 0x03);
        this.set("OBJECT_RADIUS", 0);
        switch (direction) {
            case NPCWatcher.DIRECTION.UP:
                this.set("OBJECT_DIRECTION_WALKING", 1);
                this.set("OBJECT_FACING", 4);
                this.set("OBJECT_NEXT_MAP_X", this.npc.OBJECT_MAP_X);
                this.set("OBJECT_NEXT_MAP_Y", this.npc.OBJECT_MAP_Y - 1);
                break;
            case NPCWatcher.DIRECTION.DOWN:
                this.set("OBJECT_DIRECTION_WALKING", 0);
                this.set("OBJECT_FACING", 0);
                this.set("OBJECT_NEXT_MAP_X", this.npc.OBJECT_MAP_X);
                this.set("OBJECT_NEXT_MAP_Y", this.npc.OBJECT_MAP_Y + 1);
                break;
            case NPCWatcher.DIRECTION.LEFT:
                this.set("OBJECT_DIRECTION_WALKING", 2);
                this.set("OBJECT_FACING", 8);
                this.set("OBJECT_NEXT_MAP_X", this.npc.OBJECT_MAP_X - 1);
                this.set("OBJECT_NEXT_MAP_Y", this.npc.OBJECT_MAP_Y);
                break;
            case NPCWatcher.DIRECTION.RIGHT:
                this.set("OBJECT_DIRECTION_WALKING", 3);
                this.set("OBJECT_FACING", 0x0C);
                this.set("OBJECT_NEXT_MAP_X", this.npc.OBJECT_MAP_X + 1);
                this.set("OBJECT_NEXT_MAP_Y", this.npc.OBJECT_MAP_Y);
                break;
        }
    };
    NPCWatcher.prototype.reset = function (npc) {
        this.npc = npc;
        this.mustUpdate = true;
        this.created = false;
        for (var i = 0; i < Object.keys(this.npc).length; i++) {
            this.valuesToUpdate[Object.keys(this.npc)[i]] = true;
        }
    };
    NPCWatcher.prototype.update = function () {
        if (this.emulator.memoryRead(this.slot) == 0 && this.created == true) {
            // Il a été supprimé, on le réalloue
            return false;
        }
        if (this.created == false)
            this.created = true;
        if (this.mustUpdate == false)
            return true;
        var cell = this.slot;
        for (var i = 0; i < Object.keys(this.npc).length; i++) {
            if (this.valuesToUpdate[Object.keys(this.npc)[i]] == true) {
                this.emulator.memoryWrite(cell, this.npc[Object.keys(this.npc)[i]]);
                this.valuesToUpdate[Object.keys(this.npc)[i]] = false;
            }
            else
                this.npc[Object.keys(this.npc)[i]] = this.emulator.memoryRead(cell);
            this.emulator.memoryWrite(cell, this.npc[Object.keys(this.npc)[i]]);
            cell = cell + 0x01;
        }
        this.mustUpdate = false;
        return true;
    };
    NPCWatcher.DIRECTION = {
        "UP": 0,
        "DOWN": 1,
        "LEFT": 2,
        "RIGHT": 3
    };
    return NPCWatcher;
}());
var GBPluginNPCInjector = /** @class */ (function (_super) {
    __extends(GBPluginNPCInjector, _super);
    function GBPluginNPCInjector() {
        var _this = _super.call(this) || this;
        _this.npcsToAdd = [];
        _this.npcsAdded = [];
        window.GBPluginScheduler.GetInstance().registerPluginRun(_this);
        return _this;
    }
    GBPluginNPCInjector.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
        for (var i = 0; i < this.npcsAdded.length;) {
            if (this.npcsAdded[i].update() == false) {
                this.npcsToAdd.push(this.npcsAdded[i].npc);
                this.npcsAdded.splice(i, 1);
            }
            else
                i++;
        }
        if (this.npcsToAdd.length <= 0)
            return;
        var freeSlot = this.searchFreeNPCSlot(emulator);
        if (freeSlot == null)
            return;
        this.addNPC(emulator, freeSlot, this.npcsToAdd.shift());
    };
    GBPluginNPCInjector.prototype.registerNPC = function (npc) {
        this.npcsToAdd.push(npc);
    };
    GBPluginNPCInjector.prototype.searchFreeNPCSlot = function (emulator) {
        var current = GBPluginNPCInjector.NPCBLOCKSTART;
        while (emulator.memoryRead(current) != 0x0 && current < 0xD720) {
            current = current + 0x28;
        }
        if (current < 0xD720)
            return current;
        else
            return null;
    };
    GBPluginNPCInjector.prototype.addNPC = function (emulator, slot, npc) {
        var p = new NPCWatcher(emulator, slot, npc);
        p.update();
        this.npcsAdded.push(p);
    };
    GBPluginNPCInjector.NPCBLOCKSTART = 0xD4D6;
    return GBPluginNPCInjector;
}(GBPlugin));
// Injection
window.NPCInjector = new GBPluginNPCInjector();
/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />
var GBPluginNPCInfo = /** @class */ (function (_super) {
    __extends(GBPluginNPCInfo, _super);
    function GBPluginNPCInfo() {
        var _this = _super.call(this) || this;
        _this.npcs = [];
        window.GBPluginScheduler.GetInstance().registerPluginRun(_this);
        return _this;
    }
    GBPluginNPCInfo.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
        //console.log("NPC INFO");
        this.npcs = this.searchNPCS(emulator);
    };
    GBPluginNPCInfo.prototype.searchNPCS = function (emulator) {
        var results = [];
        var current = GBPluginNPCInfo.NPCBLOCKSTART;
        while (current < 0xD720) {
            if (emulator.memoryRead(current) != 0x0)
                results.push(this.generateNPCFromRAM(emulator, current));
            current = current + 0x28;
        }
        return results;
    };
    GBPluginNPCInfo.prototype.generateNPCFromRAM = function (emulator, slot) {
        var npc = new NPC();
        var raw = [];
        for (var i = 0; i < Object.keys(npc).length; i++) {
            npc[Object.keys(npc)[i]] = emulator.memoryRead(slot);
            raw.push(emulator.memoryRead(slot));
            slot = slot + 0x01;
        }
        //console.log(raw);
        return npc;
    };
    GBPluginNPCInfo.NPCBLOCKSTART = 0xD4D6;
    return GBPluginNPCInfo;
}(GBPlugin));
window.NPCInfo = new GBPluginNPCInfo();
/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />
var GBPluginPlayerReceiver = /** @class */ (function (_super) {
    __extends(GBPluginPlayerReceiver, _super);
    function GBPluginPlayerReceiver() {
        var _this = _super.call(this) || this;
        _this.connected = false;
        window.GBPluginScheduler.GetInstance().registerPluginRun(_this);
        _this.iceCandidates = [];
        _this.connection = new RTCPeerConnection({
            "iceServers": [{
                    "urls": "stun:stun.l.google.com:19302",
                }]
        });
        _this.connection.onicecandidate = function (event) { _this.onIceCandidate(event); };
        _this.connection.ondatachannel = function (channel) { _this.onDataChannel(channel); };
        console.log("Waiting for offer");
        return _this;
    }
    GBPluginPlayerReceiver.prototype.setCandidates = function (candidates) {
        for (var i = 0; i < candidates.length; i++) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidates[i]));
        }
        console.log("window.Server.setCandidates(JSON.parse('" + JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\") + "'));");
    };
    GBPluginPlayerReceiver.prototype.receiveOffer = function (offerSdp) {
        var _this = this;
        this.connection.setRemoteDescription(offerSdp);
        this.connection.createAnswer().then(function (answer) {
            _this.connection.setLocalDescription(answer);
            console.log('window.Server.setRemoteDescription(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(answer).replace(/\\/g, "\\\\") + '\')));');
        }).catch(function (error) { });
    };
    GBPluginPlayerReceiver.prototype.onIceCandidate = function (event) {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    };
    GBPluginPlayerReceiver.prototype.onDataChannel = function (event) {
        var _this = this;
        this.channel = event.channel;
        this.channel.onmessage = function (e) { _this.onMessage(e); };
        this.channel.onopen = function (e) { _this.onOpen(e); };
        this.channel.onclose = function (e) { _this.onClose(e); };
    };
    GBPluginPlayerReceiver.prototype.onOpen = function (e) {
        console.log("New Connection");
        this.connected = true;
    };
    GBPluginPlayerReceiver.prototype.onClose = function (e) {
        console.log("Close Connection");
        this.connected = false;
    };
    GBPluginPlayerReceiver.prototype.onError = function (e) {
        console.log(e);
        this.connected = false;
    };
    GBPluginPlayerReceiver.prototype.onMessage = function (e) {
        //console.log(e);
        //return;
        //console.log(JSON.parse(e.data));        
        var player = JSON.parse(e.data);
        if (window.NPCInjector.npcsAdded.length <= 0) {
            window.NPCInjector.registerNPC(player);
        }
        else {
            window.NPCInjector.npcsAdded[0].reset(player);
        }
    };
    GBPluginPlayerReceiver.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
        if (this.connected == false) {
            return;
        }
        if (window.NPCInfo.npcs <= 0)
            return;
        var player = window.NPCInfo.npcs[0];
        this.channel.send(JSON.stringify(player));
    };
    return GBPluginPlayerReceiver;
}(GBPlugin));
window.Client = new GBPluginPlayerReceiver();
/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />
var GBPluginPlayerSender = /** @class */ (function (_super) {
    __extends(GBPluginPlayerSender, _super);
    function GBPluginPlayerSender() {
        var _this = _super.call(this) || this;
        _this.connected = false;
        _this.other = null;
        window.GBPluginScheduler.GetInstance().registerPluginRun(_this);
        _this.iceCandidates = [];
        _this.connection = new RTCPeerConnection({
            "iceServers": [{
                    "urls": "stun:stun.l.google.com:19302",
                }]
        });
        _this.connection.onicecandidate = function (event) { _this.OnIceCandidate(event); };
        _this.channel = _this.connection.createDataChannel('PlayerExchange', {});
        _this.channel.onmessage = function (e) { _this.onMessage(e); };
        _this.channel.onopen = function (e) { _this.onOpen(e); };
        _this.channel.onclose = function (e) { _this.onClose(e); };
        _this.connection.createOffer().then(function (offer) {
            _this.connection.setLocalDescription(offer);
            console.log('window.Client.receiveOffer(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(offer).replace(/\\/g, "\\\\") + '\')));');
        }).catch(function (error) {
        });
        console.log("STARTING NETWORK");
        return _this;
    }
    GBPluginPlayerSender.prototype.setCandidates = function (candidates) {
        for (var i = 0; i < candidates.length; i++) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidates[i]));
        }
    };
    GBPluginPlayerSender.prototype.setRemoteDescription = function (desc) {
        this.connection.setRemoteDescription(desc);
        console.log("window.Client.setCandidates(JSON.parse('" + JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\") + "'));");
    };
    GBPluginPlayerSender.prototype.OnIceCandidate = function (event) {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    };
    GBPluginPlayerSender.prototype.onOpen = function (e) {
        this.connected = true;
    };
    GBPluginPlayerSender.prototype.onClose = function (e) {
        this.connected = false;
    };
    GBPluginPlayerSender.prototype.onError = function (e) {
        this.connected = false;
    };
    GBPluginPlayerSender.prototype.onMessage = function (e) {
        //console.log(JSON.parse(e.data));
        var player = JSON.parse(e.data);
        if (window.NPCInjector.npcsAdded.length <= 0) {
            this.other = window.NPCInjector.registerNPC(player);
        }
        else {
            window.NPCInjector.npcsAdded[0].reset(player);
        }
    };
    GBPluginPlayerSender.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
        if (this.connected == false) {
            return;
        }
        if (window.NPCInfo.npcs <= 0)
            return;
        var player = window.NPCInfo.npcs[0];
        this.channel.send(JSON.stringify(player));
    };
    return GBPluginPlayerSender;
}(GBPlugin));
window.Server = new GBPluginPlayerSender();
//# sourceMappingURL=plugins-temp.js.map
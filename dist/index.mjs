var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/sdp/sdp.js
var require_sdp = __commonJS({
  "node_modules/sdp/sdp.js"(exports, module) {
    "use strict";
    var SDPUtils2 = {};
    SDPUtils2.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12);
    };
    SDPUtils2.localCName = SDPUtils2.generateIdentifier();
    SDPUtils2.splitLines = function(blob) {
      return blob.trim().split("\n").map((line) => line.trim());
    };
    SDPUtils2.splitSections = function(blob) {
      const parts = blob.split("\nm=");
      return parts.map((part, index) => (index > 0 ? "m=" + part : part).trim() + "\r\n");
    };
    SDPUtils2.getDescription = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      return sections && sections[0];
    };
    SDPUtils2.getMediaSections = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      sections.shift();
      return sections;
    };
    SDPUtils2.matchPrefix = function(blob, prefix) {
      return SDPUtils2.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
    };
    SDPUtils2.parseCandidate = function(line) {
      let parts;
      if (line.indexOf("a=candidate:") === 0) {
        parts = line.substring(12).split(" ");
      } else {
        parts = line.substring(10).split(" ");
      }
      const candidate = {
        foundation: parts[0],
        component: { 1: "rtp", 2: "rtcp" }[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4],
        // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7]
      };
      for (let i = 8; i < parts.length; i += 2) {
        switch (parts[i]) {
          case "raddr":
            candidate.relatedAddress = parts[i + 1];
            break;
          case "rport":
            candidate.relatedPort = parseInt(parts[i + 1], 10);
            break;
          case "tcptype":
            candidate.tcpType = parts[i + 1];
            break;
          case "ufrag":
            candidate.ufrag = parts[i + 1];
            candidate.usernameFragment = parts[i + 1];
            break;
          default:
            if (candidate[parts[i]] === void 0) {
              candidate[parts[i]] = parts[i + 1];
            }
            break;
        }
      }
      return candidate;
    };
    SDPUtils2.writeCandidate = function(candidate) {
      const sdp2 = [];
      sdp2.push(candidate.foundation);
      const component = candidate.component;
      if (component === "rtp") {
        sdp2.push(1);
      } else if (component === "rtcp") {
        sdp2.push(2);
      } else {
        sdp2.push(component);
      }
      sdp2.push(candidate.protocol.toUpperCase());
      sdp2.push(candidate.priority);
      sdp2.push(candidate.address || candidate.ip);
      sdp2.push(candidate.port);
      const type = candidate.type;
      sdp2.push("typ");
      sdp2.push(type);
      if (type !== "host" && candidate.relatedAddress && candidate.relatedPort) {
        sdp2.push("raddr");
        sdp2.push(candidate.relatedAddress);
        sdp2.push("rport");
        sdp2.push(candidate.relatedPort);
      }
      if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
        sdp2.push("tcptype");
        sdp2.push(candidate.tcpType);
      }
      if (candidate.usernameFragment || candidate.ufrag) {
        sdp2.push("ufrag");
        sdp2.push(candidate.usernameFragment || candidate.ufrag);
      }
      return "candidate:" + sdp2.join(" ");
    };
    SDPUtils2.parseIceOptions = function(line) {
      return line.substring(14).split(" ");
    };
    SDPUtils2.parseRtpMap = function(line) {
      let parts = line.substring(9).split(" ");
      const parsed = {
        payloadType: parseInt(parts.shift(), 10)
        // was: id
      };
      parts = parts[0].split("/");
      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10);
      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
      parsed.numChannels = parsed.channels;
      return parsed;
    };
    SDPUtils2.writeRtpMap = function(codec) {
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      const channels = codec.channels || codec.numChannels || 1;
      return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
    };
    SDPUtils2.parseExtmap = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
        uri: parts[1],
        attributes: parts.slice(2).join(" ")
      };
    };
    SDPUtils2.writeExtmap = function(headerExtension) {
      return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
    };
    SDPUtils2.parseFmtp = function(line) {
      const parsed = {};
      let kv;
      const parts = line.substring(line.indexOf(" ") + 1).split(";");
      for (let j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split("=");
        parsed[kv[0].trim()] = kv[1];
      }
      return parsed;
    };
    SDPUtils2.writeFmtp = function(codec) {
      let line = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.parameters && Object.keys(codec.parameters).length) {
        const params = [];
        Object.keys(codec.parameters).forEach((param) => {
          if (codec.parameters[param] !== void 0) {
            params.push(param + "=" + codec.parameters[param]);
          } else {
            params.push(param);
          }
        });
        line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
      }
      return line;
    };
    SDPUtils2.parseRtcpFb = function(line) {
      const parts = line.substring(line.indexOf(" ") + 1).split(" ");
      return {
        type: parts.shift(),
        parameter: parts.join(" ")
      };
    };
    SDPUtils2.writeRtcpFb = function(codec) {
      let lines = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        codec.rtcpFeedback.forEach((fb) => {
          lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
        });
      }
      return lines;
    };
    SDPUtils2.parseSsrcMedia = function(line) {
      const sp = line.indexOf(" ");
      const parts = {
        ssrc: parseInt(line.substring(7, sp), 10)
      };
      const colon = line.indexOf(":", sp);
      if (colon > -1) {
        parts.attribute = line.substring(sp + 1, colon);
        parts.value = line.substring(colon + 1);
      } else {
        parts.attribute = line.substring(sp + 1);
      }
      return parts;
    };
    SDPUtils2.parseSsrcGroup = function(line) {
      const parts = line.substring(13).split(" ");
      return {
        semantics: parts.shift(),
        ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
      };
    };
    SDPUtils2.getMid = function(mediaSection) {
      const mid = SDPUtils2.matchPrefix(mediaSection, "a=mid:")[0];
      if (mid) {
        return mid.substring(6);
      }
    };
    SDPUtils2.parseFingerprint = function(line) {
      const parts = line.substring(14).split(" ");
      return {
        algorithm: parts[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase()
        // the definition is upper-case in RFC 4572.
      };
    };
    SDPUtils2.getDtlsParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=fingerprint:"
      );
      return {
        role: "auto",
        fingerprints: lines.map(SDPUtils2.parseFingerprint)
      };
    };
    SDPUtils2.writeDtlsParameters = function(params, setupType) {
      let sdp2 = "a=setup:" + setupType + "\r\n";
      params.fingerprints.forEach((fp) => {
        sdp2 += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
      });
      return sdp2;
    };
    SDPUtils2.parseCryptoLine = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3)
      };
    };
    SDPUtils2.writeCryptoLine = function(parameters) {
      return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils2.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
    };
    SDPUtils2.parseCryptoKeyParams = function(keyParams) {
      if (keyParams.indexOf("inline:") !== 0) {
        return null;
      }
      const parts = keyParams.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
        mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
      };
    };
    SDPUtils2.writeCryptoKeyParams = function(keyParams) {
      return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
    };
    SDPUtils2.getCryptoParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=crypto:"
      );
      return lines.map(SDPUtils2.parseCryptoLine);
    };
    SDPUtils2.getIceParameters = function(mediaSection, sessionpart) {
      const ufrag = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-ufrag:"
      )[0];
      const pwd = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-pwd:"
      )[0];
      if (!(ufrag && pwd)) {
        return null;
      }
      return {
        usernameFragment: ufrag.substring(12),
        password: pwd.substring(10)
      };
    };
    SDPUtils2.writeIceParameters = function(params) {
      let sdp2 = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
      if (params.iceLite) {
        sdp2 += "a=ice-lite\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseRtpParameters = function(mediaSection) {
      const description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      };
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      description.profile = mline[2];
      for (let i = 3; i < mline.length; i++) {
        const pt = mline[i];
        const rtpmapline = SDPUtils2.matchPrefix(
          mediaSection,
          "a=rtpmap:" + pt + " "
        )[0];
        if (rtpmapline) {
          const codec = SDPUtils2.parseRtpMap(rtpmapline);
          const fmtps = SDPUtils2.matchPrefix(
            mediaSection,
            "a=fmtp:" + pt + " "
          );
          codec.parameters = fmtps.length ? SDPUtils2.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils2.matchPrefix(
            mediaSection,
            "a=rtcp-fb:" + pt + " "
          ).map(SDPUtils2.parseRtcpFb);
          description.codecs.push(codec);
          switch (codec.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              description.fecMechanisms.push(codec.name.toUpperCase());
              break;
            default:
              break;
          }
        }
      }
      SDPUtils2.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
        description.headerExtensions.push(SDPUtils2.parseExtmap(line));
      });
      const wildcardRtcpFb = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils2.parseRtcpFb);
      description.codecs.forEach((codec) => {
        wildcardRtcpFb.forEach((fb) => {
          const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
            return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
          });
          if (!duplicate) {
            codec.rtcpFeedback.push(fb);
          }
        });
      });
      return description;
    };
    SDPUtils2.writeRtpDescription = function(kind, caps) {
      let sdp2 = "";
      sdp2 += "m=" + kind + " ";
      sdp2 += caps.codecs.length > 0 ? "9" : "0";
      sdp2 += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
      sdp2 += caps.codecs.map((codec) => {
        if (codec.preferredPayloadType !== void 0) {
          return codec.preferredPayloadType;
        }
        return codec.payloadType;
      }).join(" ") + "\r\n";
      sdp2 += "c=IN IP4 0.0.0.0\r\n";
      sdp2 += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
      caps.codecs.forEach((codec) => {
        sdp2 += SDPUtils2.writeRtpMap(codec);
        sdp2 += SDPUtils2.writeFmtp(codec);
        sdp2 += SDPUtils2.writeRtcpFb(codec);
      });
      let maxptime = 0;
      caps.codecs.forEach((codec) => {
        if (codec.maxptime > maxptime) {
          maxptime = codec.maxptime;
        }
      });
      if (maxptime > 0) {
        sdp2 += "a=maxptime:" + maxptime + "\r\n";
      }
      if (caps.headerExtensions) {
        caps.headerExtensions.forEach((extension) => {
          sdp2 += SDPUtils2.writeExtmap(extension);
        });
      }
      return sdp2;
    };
    SDPUtils2.parseRtpEncodingParameters = function(mediaSection) {
      const encodingParameters = [];
      const description = SDPUtils2.parseRtpParameters(mediaSection);
      const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
      const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
      const ssrcs = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
      const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      let secondarySsrc;
      const flows = SDPUtils2.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
        const parts = line.substring(17).split(" ");
        return parts.map((part) => parseInt(part, 10));
      });
      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }
      description.codecs.forEach((codec) => {
        if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
          let encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10)
          };
          if (primarySsrc && secondarySsrc) {
            encParam.rtx = { ssrc: secondarySsrc };
          }
          encodingParameters.push(encParam);
          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? "red+ulpfec" : "red"
            };
            encodingParameters.push(encParam);
          }
        }
      });
      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc
        });
      }
      let bandwidth = SDPUtils2.matchPrefix(mediaSection, "b=");
      if (bandwidth.length) {
        if (bandwidth[0].indexOf("b=TIAS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(7), 10);
        } else if (bandwidth[0].indexOf("b=AS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
        } else {
          bandwidth = void 0;
        }
        encodingParameters.forEach((params) => {
          params.maxBitrate = bandwidth;
        });
      }
      return encodingParameters;
    };
    SDPUtils2.parseRtcpParameters = function(mediaSection) {
      const rtcpParameters = {};
      const remoteSsrc = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      }
      const rsize = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-rsize");
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0;
      const mux = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-mux");
      rtcpParameters.mux = mux.length > 0;
      return rtcpParameters;
    };
    SDPUtils2.writeRtcpParameters = function(rtcpParameters) {
      let sdp2 = "";
      if (rtcpParameters.reducedSize) {
        sdp2 += "a=rtcp-rsize\r\n";
      }
      if (rtcpParameters.mux) {
        sdp2 += "a=rtcp-mux\r\n";
      }
      if (rtcpParameters.ssrc !== void 0 && rtcpParameters.cname) {
        sdp2 += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseMsid = function(mediaSection) {
      let parts;
      const spec = SDPUtils2.matchPrefix(mediaSection, "a=msid:");
      if (spec.length === 1) {
        parts = spec[0].substring(7).split(" ");
        return { stream: parts[0], track: parts[1] };
      }
      const planB = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
      if (planB.length > 0) {
        parts = planB[0].value.split(" ");
        return { stream: parts[0], track: parts[1] };
      }
    };
    SDPUtils2.parseSctpDescription = function(mediaSection) {
      const mline = SDPUtils2.parseMLine(mediaSection);
      const maxSizeLine = SDPUtils2.matchPrefix(mediaSection, "a=max-message-size:");
      let maxMessageSize;
      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
      }
      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }
      const sctpPort = SDPUtils2.matchPrefix(mediaSection, "a=sctp-port:");
      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substring(12), 10),
          protocol: mline.fmt,
          maxMessageSize
        };
      }
      const sctpMapLines = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:");
      if (sctpMapLines.length > 0) {
        const parts = sctpMapLines[0].substring(10).split(" ");
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize
        };
      }
    };
    SDPUtils2.writeSctpDescription = function(media, sctp) {
      let output = [];
      if (media.protocol !== "DTLS/SCTP") {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctp-port:" + sctp.port + "\r\n"
        ];
      } else {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"
        ];
      }
      if (sctp.maxMessageSize !== void 0) {
        output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
      }
      return output.join("");
    };
    SDPUtils2.generateSessionId = function() {
      return Math.random().toString().substr(2, 22);
    };
    SDPUtils2.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
      let sessionId;
      const version = sessVer !== void 0 ? sessVer : 2;
      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils2.generateSessionId();
      }
      const user = sessUser || "thisisadapterortc";
      return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
    };
    SDPUtils2.getDirection = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.splitLines(mediaSection);
      for (let i = 0; i < lines.length; i++) {
        switch (lines[i]) {
          case "a=sendrecv":
          case "a=sendonly":
          case "a=recvonly":
          case "a=inactive":
            return lines[i].substring(2);
          default:
        }
      }
      if (sessionpart) {
        return SDPUtils2.getDirection(sessionpart);
      }
      return "sendrecv";
    };
    SDPUtils2.getKind = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      return mline[0].substring(2);
    };
    SDPUtils2.isRejected = function(mediaSection) {
      return mediaSection.split(" ", 2)[1] === "0";
    };
    SDPUtils2.parseMLine = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const parts = lines[0].substring(2).split(" ");
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(" ")
      };
    };
    SDPUtils2.parseOLine = function(mediaSection) {
      const line = SDPUtils2.matchPrefix(mediaSection, "o=")[0];
      const parts = line.substring(2).split(" ");
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5]
      };
    };
    SDPUtils2.isValidSDP = function(blob) {
      if (typeof blob !== "string" || blob.length === 0) {
        return false;
      }
      const lines = SDPUtils2.splitLines(blob);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
          return false;
        }
      }
      return true;
    };
    if (typeof module === "object") {
      module.exports = SDPUtils2;
    }
  }
});

// src/localStorage.ts
var storage = (() => {
  return {
    /**
     * Saves a value to localStorage under the specified key.
     * 
     * @param {string} key - The key under which the value will be stored.
     * @param {any} value - The value to store. Objects will be automatically stringified to JSON.
     * 
     * @example
     * storage.save('user', { name: 'Alice', age: 30 });
     * storage.save('theme', 'dark');
     */
    save: (key, value) => {
      log(logLevels.debug, `Saving key "${key}" with value:`, ["localStorage", "save"], value);
      localStorage.setItem(key, JSON.stringify(value));
    },
    /**
     * Loads a value from localStorage.
     * 
     * - If the key does not exist, the provided `defaultValue` is returned.
     * - If the stored value is valid JSON, it is parsed and returned.
     * - If parsing fails, the raw string is returned.
     * 
     * @param {string} key - The key of the value to retrieve.
     * @param {any} [defaultValue=null] - The default value to return if the key doesn't exist.
     * @returns {any} - The parsed value if JSON, the raw string if not JSON, or the default value if the key doesn't exist.
     * 
     * @example
     * const theme = storage.load('theme', 'light'); // Returns 'dark' if saved, or 'light' if not found
     * const user = storage.load('user'); // Returns { name: 'Alice', age: 30 }
     */
    load: (key, defaultValue = null) => {
      const value = localStorage.getItem(key);
      if (value === null) {
        log(logLevels.warning, `No value found for key "${key}". Returning default value:`, ["localStorage", "load"], defaultValue);
        return defaultValue;
      }
      try {
        log(logLevels.debug, `Value found for key "${key}". Returning value:`, ["localStorage", "load"], value);
        return JSON.parse(value);
      } catch (err) {
        log(logLevels.error, `Failed to parse value for key "${key}":`, ["localStorage", "load"], value, err);
        return value;
      }
    },
    /**
     * Lists all keys currently stored in localStorage.
     * 
     * @returns {string[]} - An array of keys currently in localStorage.
     * 
     * @example
     * const keys = storage.listKeys();
     * console.log(keys); // ['user', 'theme']
     */
    listKeys: () => {
      const keys = Object.keys(localStorage);
      log(logLevels.debug, `Available keys in localStorage:`, ["localStorage", "listKeys"], keys);
      return keys;
    }
  };
})();

// src/logging.ts
var logLevels = {
  off: 0,
  error: 1,
  warning: 2,
  debug: 3
};
var currentLogLevel = { value: logLevels.debug };
var filterKeywords = [];
var blockKeywords = ["getRandomWord", "applyCooldowns", "calculateBoundingBox", "rollingAverage"];
function log(level = logLevels.debug, message, keywords = [], ...data) {
  if (!Object.values(logLevels).includes(level)) {
    console.error(`[LOG ERROR] Invalid log level: ${level}`);
    return;
  }
  if (currentLogLevel.value < level)
    return;
  if (blockKeywords.some((keyword) => keywords.includes(keyword)))
    return;
  if (filterKeywords.length > 0 && !filterKeywords.some((keyword) => keywords.includes(keyword)))
    return;
  const copiedData = data.map((item) => {
    try {
      return JSON.parse(JSON.stringify(item));
    } catch {
      return item;
    }
  });
  const method = level === logLevels.error ? "error" : level === logLevels.warning ? "warn" : "log";
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const keywordInfo = keywords.length > 0 ? ` [Keywords: ${keywords.join(", ")}]` : "";
  console[method](`[${timestamp}] ${message}
${keywordInfo}
`, ...copiedData);
}

// src/random.ts
function rng(low, high, decimals = null) {
  const lowDecimals = (low.toString().split(".")[1] || "").length;
  const highDecimals = (high.toString().split(".")[1] || "").length;
  const derivedDecimals = Math.max(lowDecimals, highDecimals);
  const randomValue = Math.random() * (high - low) + low;
  return decimals !== null ? parseFloat(randomValue.toFixed(decimals)) : parseFloat(randomValue.toFixed(derivedDecimals));
}
function randomItem(collection) {
  if (collection.length === 0) {
    log(logLevels.error, "Cannot select a random item from an empty array.", ["randomItem"], collection);
  }
  return collection[Math.floor(rng(0, collection.length - 1))];
}
function getRndColor() {
  const red = Math.round(Math.random() * 234 + 10);
  const green = Math.round(Math.random() * 234 + 20);
  const blue = Math.round(Math.random() * 234 + 20);
  const color = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
  return color;
}
function getColorPair() {
  const red = Math.round(Math.random() * 234 + 10);
  const antiRed = Math.abs(red - 234) + 20;
  const green = Math.round(Math.random() * 234 + 20);
  const antiGreen = Math.abs(green - 234) + 20;
  const blue = Math.round(Math.random() * 234 + 20);
  const antiblue = Math.abs(blue - 234) + 20;
  const color = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
  const antiColor = "#" + antiRed.toString(16) + antiGreen.toString(16) + antiblue.toString(16);
  return { c1: color, c2: antiColor };
}
function colorFrmRange(c1, c2, percent) {
  percent = percent / 100;
  const c1R = parseInt(c1.slice(1, 3), 16);
  const c1G = parseInt(c1.slice(3, 5), 16);
  const c1B = parseInt(c1.slice(5, 7), 16);
  const c2R = parseInt(c2.slice(1, 3), 16);
  const c2G = parseInt(c2.slice(3, 5), 16);
  const c2B = parseInt(c2.slice(5, 7), 16);
  const rDif = c1R - c2R;
  const gDif = c1G - c2G;
  const bDif = c1B - c2B;
  let red = Math.round(c1R - percent * rDif).toString(16);
  let green = Math.round(c1G - percent * gDif).toString(16);
  let blue = Math.round(c1B - percent * bDif).toString(16);
  if (red.length < 2) {
    red = "0" + red;
  }
  if (green.length < 2) {
    green = "0" + green;
  }
  if (blue.length < 2) {
    blue = "0" + blue;
  }
  const color = "#" + red + green + blue;
  return color;
}
function getContrastingColor(hexColor) {
  const normalizedHex = hexColor.replace(/^#/, "");
  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

// src/test.ts
var greetLaserMace = () => {
  return "Hello from LaserMace!";
};

// src/lazyState.ts
function createLazyState(definitions) {
  const internalState = {};
  const cache = {};
  const timestamps = {};
  for (const [key, definition] of Object.entries(definitions)) {
    if (definition !== null && !Array.isArray(definition)) {
      internalState[key] = definition;
    }
  }
  const invalidateDependentCaches = (key) => {
    for (const [depKey, definition] of Object.entries(definitions)) {
      if (Array.isArray(definition) && definition[3]?.includes(key)) {
        delete cache[depKey];
        delete timestamps[depKey];
      }
    }
  };
  const resolveValue = (computeFn) => {
    const value = computeFn(proxy);
    return value instanceof Promise ? value : value;
  };
  const proxy = new Proxy({}, {
    get(_, prop) {
      if (prop === "getChanges") {
        return (since) => {
          const changes = {};
          for (const key in definitions) {
            if ((timestamps[key] || 0) > since) {
              changes[key] = proxy[key];
            }
          }
          return changes;
        };
      }
      if (typeof prop !== "string" || !(prop in definitions)) {
        throw new Error(`Property '${String(prop)}' is not defined.`);
      }
      const definition = definitions[prop];
      if (definition !== null && !Array.isArray(definition)) {
        return internalState[prop];
      }
      const [mode, computeFn, expirationMs] = definition;
      if (mode === "always") {
        return resolveValue(computeFn);
      }
      if (mode === "once") {
        if (!(prop in cache)) {
          cache[prop] = resolveValue(computeFn);
        }
        return cache[prop];
      }
      if (mode === "timed") {
        const now = Date.now();
        const lastUpdated = timestamps[prop] || 0;
        if (!(prop in cache) || now - lastUpdated > (expirationMs || 0)) {
          cache[prop] = resolveValue(computeFn);
          timestamps[prop] = now;
        }
        return cache[prop];
      }
      throw new Error(`Invalid cache mode: ${mode}`);
    },
    set(_, prop, value) {
      if (typeof prop !== "string" || !(prop in definitions)) {
        throw new Error(`Property '${String(prop)}' is not defined.`);
      }
      const definition = definitions[prop];
      if (definition !== null && !Array.isArray(definition)) {
        internalState[prop] = value;
        timestamps[prop] = Date.now();
        invalidateDependentCaches(prop);
        return true;
      }
      throw new Error(`Cannot set value for computed property '${prop}'`);
    },
    ownKeys() {
      return Reflect.ownKeys(definitions);
    },
    has(_, prop) {
      return typeof prop === "string" && prop in definitions;
    },
    getOwnPropertyDescriptor(_, prop) {
      if (typeof prop === "string" && prop in definitions) {
        return {
          enumerable: true,
          configurable: true
        };
      }
      return void 0;
    }
  });
  return proxy;
}

// src/math.ts
function createRollingAverage(rollingWindowSize, maxDeltaPercent = 10) {
  if (rollingWindowSize <= 0) {
    throw new Error("Rolling window size must be greater than 0.");
  }
  let values = [];
  let sum = 0;
  let weightedSum = 0;
  let weight = 0;
  return {
    add(value) {
      const currentAverage = values.length > 0 ? sum / values.length : 0;
      const maxDelta = currentAverage * (1 + maxDeltaPercent / 100);
      if (currentAverage > 0 && value > maxDelta && values.length > rollingWindowSize / 2) {
        log(logLevels.debug, `Sorry... ${value} didn't make the cut`, ["rollingAverage", "badValue", "math"]);
        return;
      }
      values.push(value);
      sum += value;
      const currentWeight = Math.min(values.length, rollingWindowSize);
      weightedSum += value * currentWeight;
      weight += currentWeight;
      if (values.length > rollingWindowSize) {
        const removedValue = values.shift();
        sum -= removedValue;
        weightedSum -= removedValue * rollingWindowSize;
        weight -= rollingWindowSize;
      }
    },
    getAverage() {
      if (values.length < rollingWindowSize) {
        return weight === 0 ? 0 : weightedSum / weight;
      }
      return values.length === 0 ? 0 : sum / values.length;
    }
  };
}

// src/chronoTrigger.ts
function createChronoTrigger() {
  const lastRunTimes = /* @__PURE__ */ new Map();
  let loop = null;
  let running = false;
  let fps = 0;
  const fpsHist = createRollingAverage(100);
  let lastFrameTime = 0;
  const Start = () => {
    if (typeof loop !== "function") {
      throw new Error("CT.Loop must be defined before calling CT.Start()");
    }
    running = true;
    const frame = (time) => {
      if (running) {
        if (lastFrameTime > 0) {
          const delta = time - lastFrameTime;
          const newFps = Math.round(1e3 / Math.max(delta, 1));
          fps = newFps != 1e3 ? newFps : fps;
          fpsHist.add(fps);
        }
        lastFrameTime = time;
        loop(time);
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  };
  const Stop = () => {
    running = false;
  };
  const setLoop = (loopFunction) => {
    loop = loopFunction;
  };
  const runAt = (fpsTarget, callback) => {
    if (!lastRunTimes.has(fpsTarget)) {
      lastRunTimes.set(fpsTarget, 0);
    }
    const now = performance.now();
    const interval = 1e3 / fpsTarget;
    if (fpsTarget > fps && fps > 0) {
      log(logLevels.warning, `Requested FPS (${fpsTarget}) exceeds current game FPS (${fps}). Performance may degrade.`, ["runAt, Crono"]);
    }
    if (now - (lastRunTimes.get(fpsTarget) || 0) >= interval) {
      lastRunTimes.set(fpsTarget, now);
      callback();
    }
  };
  const CurrentFPS = () => fps;
  const AverageFPS = () => Math.round(fpsHist.getAverage());
  return { Start, Stop, setLoop, runAt, CurrentFPS, AverageFPS };
}
var Crono = createChronoTrigger();

// src/utils.ts
function getKeyNameByValue(obj, value) {
  return Object.entries(obj).find(([, v]) => v === value)?.[0] || "unknown";
}
function expose(variableObj) {
  const [name, value] = Object.entries(variableObj)[0];
  window[name] = value;
}
function getSafeValueById(id, defaultValue = null) {
  const element = document.getElementById(id);
  if (element && "value" in element) {
    return element.value;
  } else {
    log(
      logLevels.warning,
      `Element with ID "${id}" not found or does not have a value property. Returning default: "${defaultValue}"`,
      ["DOM", "getSafeValueById"],
      { id, defaultValue }
    );
    return defaultValue;
  }
}
function attachOnClick(id, fn, params, callback, ...callbackParams) {
  const element = document.getElementById(id);
  log(
    logLevels.debug,
    `Attempting to attach an onclick event to element with ID "${id}".`,
    ["attachOnClick", "eventBinding"],
    { id, params, callbackParams }
  );
  if (element) {
    element.onclick = () => {
      const result = fn(...params);
      if (callback) {
        callback(result, ...callbackParams);
      }
    };
  } else {
    console.error(`Element with ID "${id}" not found.`);
  }
}
function defineComputedProperty(target, name, getter) {
  Object.defineProperty(target, name, {
    get: getter,
    enumerable: true
  });
}
function defineComputedProperties(target, properties) {
  properties.forEach(([name, getter]) => {
    defineComputedProperty(target, name, getter);
  });
}
function removeByIdInPlace(array, idToRemove) {
  const index = array.findIndex((item) => item.id === idToRemove);
  if (index !== -1)
    array.splice(index, 1);
}

// src/httpRequests.ts
async function sendRequest(url, payload) {
  log(logLevels.debug, "Initiating request", ["network", "sendRequest"], { url, payload });
  const noPayload = !payload || Object.keys(payload).length === 0;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5e3);
  try {
    log(logLevels.debug, "Sending payload to URL", ["network", "sendRequest"], { url });
    let response;
    if (noPayload) {
      response = await fetch(url);
    } else {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    }
    if (!response.ok) {
      log(logLevels.error, "Request failed", ["network", "sendRequest"], { status: response.status });
      throw new Error(`Request failed with status ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    let data, dataType;
    if (contentType?.includes("application/json")) {
      data = await response.json();
      dataType = "json";
    } else if (contentType?.includes("text/")) {
      data = await response.text();
      dataType = "text";
    } else {
      data = await response.blob();
      dataType = "blob";
    }
    log(logLevels.debug, `Request succeeded as "${dataType}"`, ["network", "debug", "sendRequest"], { data });
    return data;
  } catch (error) {
    log(logLevels.error, "Error during request", ["network", "error", "sendRequest"], error);
    return void 0;
  } finally {
    clearTimeout(timeout);
  }
}

// node_modules/peerjs-js-binarypack/dist/binarypack.mjs
var $e8379818650e2442$export$93654d4f2d6cd524 = class {
  constructor() {
    this.encoder = new TextEncoder();
    this._pieces = [];
    this._parts = [];
  }
  append_buffer(data) {
    this.flush();
    this._parts.push(data);
  }
  append(data) {
    this._pieces.push(data);
  }
  flush() {
    if (this._pieces.length > 0) {
      const buf = new Uint8Array(this._pieces);
      this._parts.push(buf);
      this._pieces = [];
    }
  }
  toArrayBuffer() {
    const buffer = [];
    for (const part of this._parts)
      buffer.push(part);
    return $e8379818650e2442$var$concatArrayBuffers(buffer).buffer;
  }
};
function $e8379818650e2442$var$concatArrayBuffers(bufs) {
  let size = 0;
  for (const buf of bufs)
    size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    result.set(view, offset);
    offset += buf.byteLength;
  }
  return result;
}
function $0cfd7828ad59115f$export$417857010dc9287f(data) {
  const unpacker = new $0cfd7828ad59115f$var$Unpacker(data);
  return unpacker.unpack();
}
function $0cfd7828ad59115f$export$2a703dbb0cb35339(data) {
  const packer = new $0cfd7828ad59115f$export$b9ec4b114aa40074();
  const res = packer.pack(data);
  if (res instanceof Promise)
    return res.then(() => packer.getBuffer());
  return packer.getBuffer();
}
var $0cfd7828ad59115f$var$Unpacker = class {
  constructor(data) {
    this.index = 0;
    this.dataBuffer = data;
    this.dataView = new Uint8Array(this.dataBuffer);
    this.length = this.dataBuffer.byteLength;
  }
  unpack() {
    const type = this.unpack_uint8();
    if (type < 128)
      return type;
    else if ((type ^ 224) < 32)
      return (type ^ 224) - 32;
    let size;
    if ((size = type ^ 160) <= 15)
      return this.unpack_raw(size);
    else if ((size = type ^ 176) <= 15)
      return this.unpack_string(size);
    else if ((size = type ^ 144) <= 15)
      return this.unpack_array(size);
    else if ((size = type ^ 128) <= 15)
      return this.unpack_map(size);
    switch (type) {
      case 192:
        return null;
      case 193:
        return void 0;
      case 194:
        return false;
      case 195:
        return true;
      case 202:
        return this.unpack_float();
      case 203:
        return this.unpack_double();
      case 204:
        return this.unpack_uint8();
      case 205:
        return this.unpack_uint16();
      case 206:
        return this.unpack_uint32();
      case 207:
        return this.unpack_uint64();
      case 208:
        return this.unpack_int8();
      case 209:
        return this.unpack_int16();
      case 210:
        return this.unpack_int32();
      case 211:
        return this.unpack_int64();
      case 212:
        return void 0;
      case 213:
        return void 0;
      case 214:
        return void 0;
      case 215:
        return void 0;
      case 216:
        size = this.unpack_uint16();
        return this.unpack_string(size);
      case 217:
        size = this.unpack_uint32();
        return this.unpack_string(size);
      case 218:
        size = this.unpack_uint16();
        return this.unpack_raw(size);
      case 219:
        size = this.unpack_uint32();
        return this.unpack_raw(size);
      case 220:
        size = this.unpack_uint16();
        return this.unpack_array(size);
      case 221:
        size = this.unpack_uint32();
        return this.unpack_array(size);
      case 222:
        size = this.unpack_uint16();
        return this.unpack_map(size);
      case 223:
        size = this.unpack_uint32();
        return this.unpack_map(size);
    }
  }
  unpack_uint8() {
    const byte = this.dataView[this.index] & 255;
    this.index++;
    return byte;
  }
  unpack_uint16() {
    const bytes = this.read(2);
    const uint16 = (bytes[0] & 255) * 256 + (bytes[1] & 255);
    this.index += 2;
    return uint16;
  }
  unpack_uint32() {
    const bytes = this.read(4);
    const uint32 = ((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3];
    this.index += 4;
    return uint32;
  }
  unpack_uint64() {
    const bytes = this.read(8);
    const uint64 = ((((((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) * 256 + bytes[4]) * 256 + bytes[5]) * 256 + bytes[6]) * 256 + bytes[7];
    this.index += 8;
    return uint64;
  }
  unpack_int8() {
    const uint8 = this.unpack_uint8();
    return uint8 < 128 ? uint8 : uint8 - 256;
  }
  unpack_int16() {
    const uint16 = this.unpack_uint16();
    return uint16 < 32768 ? uint16 : uint16 - 65536;
  }
  unpack_int32() {
    const uint32 = this.unpack_uint32();
    return uint32 < 2 ** 31 ? uint32 : uint32 - 2 ** 32;
  }
  unpack_int64() {
    const uint64 = this.unpack_uint64();
    return uint64 < 2 ** 63 ? uint64 : uint64 - 2 ** 64;
  }
  unpack_raw(size) {
    if (this.length < this.index + size)
      throw new Error(`BinaryPackFailure: index is out of range ${this.index} ${size} ${this.length}`);
    const buf = this.dataBuffer.slice(this.index, this.index + size);
    this.index += size;
    return buf;
  }
  unpack_string(size) {
    const bytes = this.read(size);
    let i = 0;
    let str = "";
    let c;
    let code;
    while (i < size) {
      c = bytes[i];
      if (c < 160) {
        code = c;
        i++;
      } else if ((c ^ 192) < 32) {
        code = (c & 31) << 6 | bytes[i + 1] & 63;
        i += 2;
      } else if ((c ^ 224) < 16) {
        code = (c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
        i += 3;
      } else {
        code = (c & 7) << 18 | (bytes[i + 1] & 63) << 12 | (bytes[i + 2] & 63) << 6 | bytes[i + 3] & 63;
        i += 4;
      }
      str += String.fromCodePoint(code);
    }
    this.index += size;
    return str;
  }
  unpack_array(size) {
    const objects = new Array(size);
    for (let i = 0; i < size; i++)
      objects[i] = this.unpack();
    return objects;
  }
  unpack_map(size) {
    const map = {};
    for (let i = 0; i < size; i++) {
      const key = this.unpack();
      map[key] = this.unpack();
    }
    return map;
  }
  unpack_float() {
    const uint32 = this.unpack_uint32();
    const sign = uint32 >> 31;
    const exp = (uint32 >> 23 & 255) - 127;
    const fraction = uint32 & 8388607 | 8388608;
    return (sign === 0 ? 1 : -1) * fraction * 2 ** (exp - 23);
  }
  unpack_double() {
    const h32 = this.unpack_uint32();
    const l32 = this.unpack_uint32();
    const sign = h32 >> 31;
    const exp = (h32 >> 20 & 2047) - 1023;
    const hfrac = h32 & 1048575 | 1048576;
    const frac = hfrac * 2 ** (exp - 20) + l32 * 2 ** (exp - 52);
    return (sign === 0 ? 1 : -1) * frac;
  }
  read(length) {
    const j = this.index;
    if (j + length <= this.length)
      return this.dataView.subarray(j, j + length);
    else
      throw new Error("BinaryPackFailure: read index out of range");
  }
};
var $0cfd7828ad59115f$export$b9ec4b114aa40074 = class {
  getBuffer() {
    return this._bufferBuilder.toArrayBuffer();
  }
  pack(value) {
    if (typeof value === "string")
      this.pack_string(value);
    else if (typeof value === "number") {
      if (Math.floor(value) === value)
        this.pack_integer(value);
      else
        this.pack_double(value);
    } else if (typeof value === "boolean") {
      if (value === true)
        this._bufferBuilder.append(195);
      else if (value === false)
        this._bufferBuilder.append(194);
    } else if (value === void 0)
      this._bufferBuilder.append(192);
    else if (typeof value === "object") {
      if (value === null)
        this._bufferBuilder.append(192);
      else {
        const constructor = value.constructor;
        if (value instanceof Array) {
          const res = this.pack_array(value);
          if (res instanceof Promise)
            return res.then(() => this._bufferBuilder.flush());
        } else if (value instanceof ArrayBuffer)
          this.pack_bin(new Uint8Array(value));
        else if ("BYTES_PER_ELEMENT" in value) {
          const v = value;
          this.pack_bin(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
        } else if (value instanceof Date)
          this.pack_string(value.toString());
        else if (value instanceof Blob)
          return value.arrayBuffer().then((buffer) => {
            this.pack_bin(new Uint8Array(buffer));
            this._bufferBuilder.flush();
          });
        else if (constructor == Object || constructor.toString().startsWith("class")) {
          const res = this.pack_object(value);
          if (res instanceof Promise)
            return res.then(() => this._bufferBuilder.flush());
        } else
          throw new Error(`Type "${constructor.toString()}" not yet supported`);
      }
    } else
      throw new Error(`Type "${typeof value}" not yet supported`);
    this._bufferBuilder.flush();
  }
  pack_bin(blob) {
    const length = blob.length;
    if (length <= 15)
      this.pack_uint8(160 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(218);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(219);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    this._bufferBuilder.append_buffer(blob);
  }
  pack_string(str) {
    const encoded = this._textEncoder.encode(str);
    const length = encoded.length;
    if (length <= 15)
      this.pack_uint8(176 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(216);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(217);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    this._bufferBuilder.append_buffer(encoded);
  }
  pack_array(ary) {
    const length = ary.length;
    if (length <= 15)
      this.pack_uint8(144 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(220);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(221);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    const packNext = (index) => {
      if (index < length) {
        const res = this.pack(ary[index]);
        if (res instanceof Promise)
          return res.then(() => packNext(index + 1));
        return packNext(index + 1);
      }
    };
    return packNext(0);
  }
  pack_integer(num) {
    if (num >= -32 && num <= 127)
      this._bufferBuilder.append(num & 255);
    else if (num >= 0 && num <= 255) {
      this._bufferBuilder.append(204);
      this.pack_uint8(num);
    } else if (num >= -128 && num <= 127) {
      this._bufferBuilder.append(208);
      this.pack_int8(num);
    } else if (num >= 0 && num <= 65535) {
      this._bufferBuilder.append(205);
      this.pack_uint16(num);
    } else if (num >= -32768 && num <= 32767) {
      this._bufferBuilder.append(209);
      this.pack_int16(num);
    } else if (num >= 0 && num <= 4294967295) {
      this._bufferBuilder.append(206);
      this.pack_uint32(num);
    } else if (num >= -2147483648 && num <= 2147483647) {
      this._bufferBuilder.append(210);
      this.pack_int32(num);
    } else if (num >= -9223372036854776e3 && num <= 9223372036854776e3) {
      this._bufferBuilder.append(211);
      this.pack_int64(num);
    } else if (num >= 0 && num <= 18446744073709552e3) {
      this._bufferBuilder.append(207);
      this.pack_uint64(num);
    } else
      throw new Error("Invalid integer");
  }
  pack_double(num) {
    let sign = 0;
    if (num < 0) {
      sign = 1;
      num = -num;
    }
    const exp = Math.floor(Math.log(num) / Math.LN2);
    const frac0 = num / 2 ** exp - 1;
    const frac1 = Math.floor(frac0 * 2 ** 52);
    const b32 = 2 ** 32;
    const h32 = sign << 31 | exp + 1023 << 20 | frac1 / b32 & 1048575;
    const l32 = frac1 % b32;
    this._bufferBuilder.append(203);
    this.pack_int32(h32);
    this.pack_int32(l32);
  }
  pack_object(obj) {
    const keys = Object.keys(obj);
    const length = keys.length;
    if (length <= 15)
      this.pack_uint8(128 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(222);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(223);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    const packNext = (index) => {
      if (index < keys.length) {
        const prop = keys[index];
        if (obj.hasOwnProperty(prop)) {
          this.pack(prop);
          const res = this.pack(obj[prop]);
          if (res instanceof Promise)
            return res.then(() => packNext(index + 1));
        }
        return packNext(index + 1);
      }
    };
    return packNext(0);
  }
  pack_uint8(num) {
    this._bufferBuilder.append(num);
  }
  pack_uint16(num) {
    this._bufferBuilder.append(num >> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_uint32(num) {
    const n = num & 4294967295;
    this._bufferBuilder.append((n & 4278190080) >>> 24);
    this._bufferBuilder.append((n & 16711680) >>> 16);
    this._bufferBuilder.append((n & 65280) >>> 8);
    this._bufferBuilder.append(n & 255);
  }
  pack_uint64(num) {
    const high = num / 2 ** 32;
    const low = num % 2 ** 32;
    this._bufferBuilder.append((high & 4278190080) >>> 24);
    this._bufferBuilder.append((high & 16711680) >>> 16);
    this._bufferBuilder.append((high & 65280) >>> 8);
    this._bufferBuilder.append(high & 255);
    this._bufferBuilder.append((low & 4278190080) >>> 24);
    this._bufferBuilder.append((low & 16711680) >>> 16);
    this._bufferBuilder.append((low & 65280) >>> 8);
    this._bufferBuilder.append(low & 255);
  }
  pack_int8(num) {
    this._bufferBuilder.append(num & 255);
  }
  pack_int16(num) {
    this._bufferBuilder.append((num & 65280) >> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_int32(num) {
    this._bufferBuilder.append(num >>> 24 & 255);
    this._bufferBuilder.append((num & 16711680) >>> 16);
    this._bufferBuilder.append((num & 65280) >>> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_int64(num) {
    const high = Math.floor(num / 2 ** 32);
    const low = num % 2 ** 32;
    this._bufferBuilder.append((high & 4278190080) >>> 24);
    this._bufferBuilder.append((high & 16711680) >>> 16);
    this._bufferBuilder.append((high & 65280) >>> 8);
    this._bufferBuilder.append(high & 255);
    this._bufferBuilder.append((low & 4278190080) >>> 24);
    this._bufferBuilder.append((low & 16711680) >>> 16);
    this._bufferBuilder.append((low & 65280) >>> 8);
    this._bufferBuilder.append(low & 255);
  }
  constructor() {
    this._bufferBuilder = new (0, $e8379818650e2442$export$93654d4f2d6cd524)();
    this._textEncoder = new TextEncoder();
  }
};

// node_modules/webrtc-adapter/src/js/utils.js
var logDisabled_ = true;
var deprecationWarnings_ = true;
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}
function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = /* @__PURE__ */ new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [
      nativeEventName,
      wrappedCallback
    ]);
  };
  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [
      nativeEventName,
      unwrappedCb
    ]);
  };
  Object.defineProperty(proto, "on" + eventNameToWrap, {
    get() {
      return this["_on" + eventNameToWrap];
    },
    set(cb) {
      if (this["_on" + eventNameToWrap]) {
        this.removeEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap]
        );
        delete this["_on" + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap] = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
}
function disableLog(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  logDisabled_ = bool;
  return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
}
function disableWarnings(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  deprecationWarnings_ = !bool;
  return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
}
function log2() {
  if (typeof window === "object") {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log.apply(console, arguments);
    }
  }
}
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
}
function detectBrowser(window2) {
  const result = { browser: null, version: null };
  if (typeof window2 === "undefined" || !window2.navigator || !window2.navigator.userAgent) {
    result.browser = "Not a browser.";
    return result;
  }
  const { navigator: navigator2 } = window2;
  if (navigator2.userAgentData && navigator2.userAgentData.brands) {
    const chromium = navigator2.userAgentData.brands.find((brand) => {
      return brand.brand === "Chromium";
    });
    if (chromium) {
      return { browser: "chrome", version: parseInt(chromium.version, 10) };
    }
  }
  if (navigator2.mozGetUserMedia) {
    result.browser = "firefox";
    result.version = extractVersion(
      navigator2.userAgent,
      /Firefox\/(\d+)\./,
      1
    );
  } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection) {
    result.browser = "chrome";
    result.version = extractVersion(
      navigator2.userAgent,
      /Chrom(e|ium)\/(\d+)\./,
      2
    );
  } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    result.browser = "safari";
    result.version = extractVersion(
      navigator2.userAgent,
      /AppleWebKit\/(\d+)\./,
      1
    );
    result.supportsUnifiedPlan = window2.RTCRtpTransceiver && "currentDirection" in window2.RTCRtpTransceiver.prototype;
  } else {
    result.browser = "Not a supported browser.";
    return result;
  }
  return result;
}
function isObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }
  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === void 0 || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, { [key]: value });
  }, {});
}
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach((name) => {
    if (name.endsWith("Id")) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith("Ids")) {
      base[name].forEach((id) => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
  const filteredResult = /* @__PURE__ */ new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach((value) => {
    if (value.type === "track" && value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach((trackStat) => {
    result.forEach((stats) => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
var chrome_shim_exports = {};
__export(chrome_shim_exports, {
  fixNegotiationNeeded: () => fixNegotiationNeeded,
  shimAddTrackRemoveTrack: () => shimAddTrackRemoveTrack,
  shimAddTrackRemoveTrackWithNative: () => shimAddTrackRemoveTrackWithNative,
  shimGetSendersWithDtmf: () => shimGetSendersWithDtmf,
  shimGetUserMedia: () => shimGetUserMedia,
  shimMediaStream: () => shimMediaStream,
  shimOnTrack: () => shimOnTrack,
  shimPeerConnection: () => shimPeerConnection,
  shimSenderReceiverGetStats: () => shimSenderReceiverGetStats
});

// node_modules/webrtc-adapter/src/js/chrome/getusermedia.js
var logging = log2;
function shimGetUserMedia(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  if (!navigator2.mediaDevices) {
    return;
  }
  const constraintsToChrome_ = function(c) {
    if (typeof c !== "object" || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach((key) => {
      if (key === "require" || key === "advanced" || key === "mediaSource") {
        return;
      }
      const r = typeof c[key] === "object" ? c[key] : { ideal: c[key] };
      if (r.exact !== void 0 && typeof r.exact === "number") {
        r.min = r.max = r.exact;
      }
      const oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return name === "deviceId" ? "sourceId" : name;
      };
      if (r.ideal !== void 0) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r.ideal === "number") {
          oc[oldname_("min", key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== void 0 && typeof r.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key)] = r.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r[mix] !== void 0) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };
  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === "object") {
      const remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, "autoGainControl", "googAutoGainControl");
      remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === "object") {
      let face = constraints.video.facingMode;
      face = face && (typeof face === "object" ? face : { ideal: face });
      const getSupportedFacingModeLies = browserDetails.version < 66;
      if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === "environment" || face.ideal === "environment") {
          matches = ["back", "rear"];
        } else if (face.exact === "user" || face.ideal === "user") {
          matches = ["front"];
        }
        if (matches) {
          return navigator2.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === "videoinput");
            let dev = devices.find((d) => matches.some((match) => d.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes("back")) {
              dev = devices[devices.length - 1];
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging("chrome: " + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging("chrome: " + JSON.stringify(constraints));
    return func(constraints);
  };
  const shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: "NotAllowedError",
        PermissionDismissedError: "NotAllowedError",
        InvalidStateError: "NotAllowedError",
        DevicesNotFoundError: "NotFoundError",
        ConstraintNotSatisfiedError: "OverconstrainedError",
        TrackStartError: "NotReadableError",
        MediaDeviceFailedDueToShutdown: "NotAllowedError",
        MediaDeviceKillSwitchOn: "NotAllowedError",
        TabCaptureError: "AbortError",
        ScreenCaptureError: "AbortError",
        DeviceCaptureError: "AbortError"
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      }
    };
  };
  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, (c) => {
      navigator2.webkitGetUserMedia(c, onSuccess, (e) => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator2.getUserMedia = getUserMedia_.bind(navigator2);
  if (navigator2.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, (c) => origGetUserMedia(c).then((stream) => {
        if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          throw new DOMException("", "NotFoundError");
        }
        return stream;
      }, (e) => Promise.reject(shimError_(e))));
    };
  }
}

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
function shimMediaStream(window2) {
  window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
}
function shimOnTrack(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener("track", this._ontrack);
        }
        this.addEventListener("track", this._ontrack = f);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      if (!this._ontrackpoly) {
        this._ontrackpoly = (e) => {
          e.stream.addEventListener("addtrack", (te) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === te.track.id);
            } else {
              receiver = { track: te.track };
            }
            const event = new Event("track");
            event.track = te.track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
          e.stream.getTracks().forEach((track) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === track.id);
            } else {
              receiver = { track };
            }
            const event = new Event("track");
            event.track = track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
        };
        this.addEventListener("addstream", this._ontrackpoly);
      }
      return origSetRemoteDescription.apply(this, arguments);
    };
  } else {
    wrapPeerConnectionEvent(window2, "track", (e) => {
      if (!e.transceiver) {
        Object.defineProperty(
          e,
          "transceiver",
          { value: { receiver: e.receiver } }
        );
      }
      return e;
    });
  }
}
function shimGetSendersWithDtmf(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && "createDTMFSender" in window2.RTCPeerConnection.prototype) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === void 0) {
            if (track.kind === "audio") {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };
    if (!window2.RTCPeerConnection.prototype.getSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice();
      };
      const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        let sender = origAddTrack.apply(this, arguments);
        if (!sender) {
          sender = shimSenderWithDtmf(this, track);
          this._senders.push(sender);
        }
        return sender;
      };
      const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        origRemoveTrack.apply(this, arguments);
        const idx = this._senders.indexOf(sender);
        if (idx !== -1) {
          this._senders.splice(idx, 1);
        }
      };
    }
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._senders = this._senders || [];
      origRemoveStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        const sender = this._senders.find((s) => s.track === track);
        if (sender) {
          this._senders.splice(this._senders.indexOf(sender), 1);
        }
      });
    };
  } else if (typeof window2 === "object" && window2.RTCPeerConnection && "getSenders" in window2.RTCPeerConnection.prototype && "createDTMFSender" in window2.RTCPeerConnection.prototype && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
    Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === void 0) {
          if (this.track.kind === "audio") {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}
function shimSenderReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
    return;
  }
  if (!("getStats" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
    }
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window2.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then((result) => (
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true)
      ));
    };
  }
  if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        const receivers = origGetReceivers.apply(this, []);
        receivers.forEach((receiver) => receiver._pc = this);
        return receivers;
      };
    }
    wrapPeerConnectionEvent(window2, "track", (e) => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window2.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then((result) => filterStats(result, receiver.track, false));
    };
  }
  if (!("getStats" in window2.RTCRtpSender.prototype && "getStats" in window2.RTCRtpReceiver.prototype)) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach((s) => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach((r) => {
        if (r.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r;
          }
        }
        return r.track === track;
      });
      if (err || sender && receiver) {
        return Promise.reject(new DOMException(
          "There are more than one sender or receiver for the track.",
          "InvalidAccessError"
        ));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException(
        "There is no sender or receiver for the track.",
        "InvalidAccessError"
      ));
    }
    return origGetStats.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrackWithNative(window2) {
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    return Object.keys(this._shimmedLocalStreams).map((streamId) => this._shimmedLocalStreams[streamId][0]);
  };
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (!stream) {
      return origAddTrack.apply(this, arguments);
    }
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const sender = origAddTrack.apply(this, arguments);
    if (!this._shimmedLocalStreams[stream.id]) {
      this._shimmedLocalStreams[stream.id] = [stream, sender];
    } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
      this._shimmedLocalStreams[stream.id].push(sender);
    }
    return sender;
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders().filter((newSender) => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    delete this._shimmedLocalStreams[stream.id];
    return origRemoveStream.apply(this, arguments);
  };
  const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    if (sender) {
      Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
        const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
        if (idx !== -1) {
          this._shimmedLocalStreams[streamId].splice(idx, 1);
        }
        if (this._shimmedLocalStreams[streamId].length === 1) {
          delete this._shimmedLocalStreams[streamId];
        }
      });
    }
    return origRemoveTrack.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrack(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window2);
  }
  const origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    const nativeStreams = origGetLocalStreams.apply(this);
    this._reverseStreams = this._reverseStreams || {};
    return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window2.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
    delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
    delete this._streams[stream.id];
  };
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    const streams = [].slice.call(arguments, 1);
    if (streams.length !== 1 || !streams[0].getTracks().find((t) => t === track)) {
      throw new DOMException(
        "The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.",
        "NotSupportedError"
      );
    }
    const alreadyExists = this.getSenders().find((s) => s.track === track);
    if (alreadyExists) {
      throw new DOMException(
        "Track already exists.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    const oldStream = this._streams[stream.id];
    if (oldStream) {
      oldStream.addTrack(track);
      Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    } else {
      const newStream = new window2.MediaStream([track]);
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      this.addStream(newStream);
    }
    return this.getSenders().find((s) => s.track === track);
  };
  function replaceInternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(internalStream.id, "g"),
        externalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(externalStream.id, "g"),
        internalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  ["createOffer", "createAnswer"].forEach(function(method) {
    const nativeMethod = window2.RTCPeerConnection.prototype[method];
    const methodObj = { [method]() {
      const args = arguments;
      const isLegacyCall = arguments.length && typeof arguments[0] === "function";
      if (isLegacyCall) {
        return nativeMethod.apply(this, [
          (description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          },
          (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          },
          arguments[2]
        ]);
      }
      return nativeMethod.apply(this, arguments).then((description) => replaceInternalStreamId(this, description));
    } };
    window2.RTCPeerConnection.prototype[method] = methodObj[method];
  });
  const origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    if (!arguments.length || !arguments[0].type) {
      return origSetLocalDescription.apply(this, arguments);
    }
    arguments[0] = replaceExternalStreamId(this, arguments[0]);
    return origSetLocalDescription.apply(this, arguments);
  };
  const origLocalDescription = Object.getOwnPropertyDescriptor(
    window2.RTCPeerConnection.prototype,
    "localDescription"
  );
  Object.defineProperty(
    window2.RTCPeerConnection.prototype,
    "localDescription",
    {
      get() {
        const description = origLocalDescription.get.apply(this);
        if (description.type === "") {
          return description;
        }
        return replaceInternalStreamId(this, description);
      }
    }
  );
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    if (!sender._pc) {
      throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    }
    const isLocal = sender._pc === this;
    if (!isLocal) {
      throw new DOMException(
        "Sender was not created by this connection.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    let stream;
    Object.keys(this._streams).forEach((streamid) => {
      const hasTrack = this._streams[streamid].getTracks().find((track) => sender.track === track);
      if (hasTrack) {
        stream = this._streams[streamid];
      }
    });
    if (stream) {
      if (stream.getTracks().length === 1) {
        this.removeStream(this._reverseStreams[stream.id]);
      } else {
        stream.removeTrack(sender.track);
      }
      this.dispatchEvent(new Event("negotiationneeded"));
    }
  };
}
function shimPeerConnection(window2, browserDetails) {
  if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
    window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
  }
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
}
function fixNegotiationNeeded(window2, browserDetails) {
  wrapPeerConnectionEvent(window2, "negotiationneeded", (e) => {
    const pc = e.target;
    if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
      if (pc.signalingState !== "stable") {
        return;
      }
    }
    return e;
  });
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
var firefox_shim_exports = {};
__export(firefox_shim_exports, {
  shimAddTransceiver: () => shimAddTransceiver,
  shimCreateAnswer: () => shimCreateAnswer,
  shimCreateOffer: () => shimCreateOffer,
  shimGetDisplayMedia: () => shimGetDisplayMedia,
  shimGetParameters: () => shimGetParameters,
  shimGetUserMedia: () => shimGetUserMedia2,
  shimOnTrack: () => shimOnTrack2,
  shimPeerConnection: () => shimPeerConnection2,
  shimRTCDataChannel: () => shimRTCDataChannel,
  shimReceiverGetStats: () => shimReceiverGetStats,
  shimRemoveStream: () => shimRemoveStream,
  shimSenderGetStats: () => shimSenderGetStats
});

// node_modules/webrtc-adapter/src/js/firefox/getusermedia.js
function shimGetUserMedia2(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  const MediaStreamTrack = window2 && window2.MediaStreamTrack;
  navigator2.getUserMedia = function(constraints, onSuccess, onError) {
    deprecated(
      "navigator.getUserMedia",
      "navigator.mediaDevices.getUserMedia"
    );
    navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
  if (!(browserDetails.version > 55 && "autoGainControl" in navigator2.mediaDevices.getSupportedConstraints())) {
    const remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };
    const nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(c) {
      if (typeof c === "object" && typeof c.audio === "object") {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, "autoGainControl", "mozAutoGainControl");
        remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
      }
      return nativeGetUserMedia(c);
    };
    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, "mozAutoGainControl", "autoGainControl");
        remap(obj, "mozNoiseSuppression", "noiseSuppression");
        return obj;
      };
    }
    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === "audio" && typeof c === "object") {
          c = JSON.parse(JSON.stringify(c));
          remap(c, "autoGainControl", "mozAutoGainControl");
          remap(c, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}

// node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js
function shimGetDisplayMedia(window2, preferredMediaSource) {
  if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
    return;
  }
  if (!window2.navigator.mediaDevices) {
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    if (!(constraints && constraints.video)) {
      const err = new DOMException("getDisplayMedia without video constraints is undefined");
      err.name = "NotFoundError";
      err.code = 8;
      return Promise.reject(err);
    }
    if (constraints.video === true) {
      constraints.video = { mediaSource: preferredMediaSource };
    } else {
      constraints.video.mediaSource = preferredMediaSource;
    }
    return window2.navigator.mediaDevices.getUserMedia(constraints);
  };
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
function shimOnTrack2(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimPeerConnection2(window2, browserDetails) {
  if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
    return;
  }
  if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
    window2.RTCPeerConnection = window2.mozRTCPeerConnection;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
  const modernStatsTypes = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate"
  };
  const nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats.apply(this, [selector || null]).then((stats) => {
      if (browserDetails.version < 53 && !onSucc) {
        try {
          stats.forEach((stat) => {
            stat.type = modernStatsTypes[stat.type] || stat.type;
          });
        } catch (e) {
          if (e.name !== "TypeError") {
            throw e;
          }
          stats.forEach((stat, i) => {
            stats.set(i, Object.assign({}, stat, {
              type: modernStatsTypes[stat.type] || stat.type
            }));
          });
        }
      }
      return stats;
    }).then(onSucc, onErr);
  };
}
function shimSenderGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
  }
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window2.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
  };
}
function shimReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach((receiver) => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window2, "track", (e) => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window2.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}
function shimRemoveStream(window2) {
  if (!window2.RTCPeerConnection || "removeStream" in window2.RTCPeerConnection.prototype) {
    return;
  }
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    deprecated("removeStream", "removeTrack");
    this.getSenders().forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.removeTrack(sender);
      }
    });
  };
}
function shimRTCDataChannel(window2) {
  if (window2.DataChannel && !window2.RTCDataChannel) {
    window2.RTCDataChannel = window2.DataChannel;
  }
}
function shimAddTransceiver(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
      this.setParametersPromises = [];
      let sendEncodings = arguments[1] && arguments[1].sendEncodings;
      if (sendEncodings === void 0) {
        sendEncodings = [];
      }
      sendEncodings = [...sendEncodings];
      const shouldPerformCheck = sendEncodings.length > 0;
      if (shouldPerformCheck) {
        sendEncodings.forEach((encodingParam) => {
          if ("rid" in encodingParam) {
            const ridRegex = /^[a-z0-9]{0,16}$/i;
            if (!ridRegex.test(encodingParam.rid)) {
              throw new TypeError("Invalid RID value provided.");
            }
          }
          if ("scaleResolutionDownBy" in encodingParam) {
            if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
              throw new RangeError("scale_resolution_down_by must be >= 1.0");
            }
          }
          if ("maxFramerate" in encodingParam) {
            if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
              throw new RangeError("max_framerate must be >= 0.0");
            }
          }
        });
      }
      const transceiver = origAddTransceiver.apply(this, arguments);
      if (shouldPerformCheck) {
        const { sender } = transceiver;
        const params = sender.getParameters();
        if (!("encodings" in params) || // Avoid being fooled by patched getParameters() below.
        params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
          params.encodings = sendEncodings;
          sender.sendEncodings = sendEncodings;
          this.setParametersPromises.push(
            sender.setParameters(params).then(() => {
              delete sender.sendEncodings;
            }).catch(() => {
              delete sender.sendEncodings;
            })
          );
        }
      }
      return transceiver;
    };
  }
}
function shimGetParameters(window2) {
  if (!(typeof window2 === "object" && window2.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window2.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window2.RTCRtpSender.prototype.getParameters = function getParameters() {
      const params = origGetParameters.apply(this, arguments);
      if (!("encodings" in params)) {
        params.encodings = [].concat(this.sendEncodings || [{}]);
      }
      return params;
    };
  }
}
function shimCreateOffer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateOffer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimCreateAnswer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
  window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateAnswer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}

// node_modules/webrtc-adapter/src/js/safari/safari_shim.js
var safari_shim_exports = {};
__export(safari_shim_exports, {
  shimAudioContext: () => shimAudioContext,
  shimCallbacksAPI: () => shimCallbacksAPI,
  shimConstraints: () => shimConstraints,
  shimCreateOfferLegacy: () => shimCreateOfferLegacy,
  shimGetUserMedia: () => shimGetUserMedia3,
  shimLocalStreamsAPI: () => shimLocalStreamsAPI,
  shimRTCIceServerUrls: () => shimRTCIceServerUrls,
  shimRemoteStreamsAPI: () => shimRemoteStreamsAPI,
  shimTrackEventTransceiver: () => shimTrackEventTransceiver
});
function shimLocalStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      return this._localStreams;
    };
  }
  if (!("addStream" in window2.RTCPeerConnection.prototype)) {
    const _addTrack = window2.RTCPeerConnection.prototype.addTrack;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      stream.getAudioTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
      stream.getVideoTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
    };
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, ...streams) {
      if (streams) {
        streams.forEach((stream) => {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
        });
      }
      return _addTrack.apply(this, arguments);
    };
  }
  if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      const index = this._localStreams.indexOf(stream);
      if (index === -1) {
        return;
      }
      this._localStreams.splice(index, 1);
      const tracks = stream.getTracks();
      this.getSenders().forEach((sender) => {
        if (tracks.includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
}
function shimRemoteStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
      return this._remoteStreams ? this._remoteStreams : [];
    };
  }
  if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener("addstream", this._onaddstream);
          this.removeEventListener("track", this._onaddstreampoly);
        }
        this.addEventListener("addstream", this._onaddstream = f);
        this.addEventListener("track", this._onaddstreampoly = (e) => {
          e.streams.forEach((stream) => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            this.dispatchEvent(event);
          });
        });
      }
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      const pc = this;
      if (!this._onaddstreampoly) {
        this.addEventListener("track", this._onaddstreampoly = function(e) {
          e.streams.forEach((stream) => {
            if (!pc._remoteStreams) {
              pc._remoteStreams = [];
            }
            if (pc._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            pc._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            pc.dispatchEvent(event);
          });
        });
      }
      return origSetRemoteDescription.apply(pc, arguments);
    };
  }
}
function shimCallbacksAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  const prototype = window2.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;
  prototype.createOffer = function createOffer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateOffer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateAnswer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;
  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;
  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}
function shimGetUserMedia3(window2) {
  const navigator2 = window2 && window2.navigator;
  if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    const mediaDevices = navigator2.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator2.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }
  if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    navigator2.getUserMedia = function getUserMedia(constraints, cb, errcb) {
      navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
    }.bind(navigator2);
  }
}
function shimConstraints(constraints) {
  if (constraints && constraints.video !== void 0) {
    return Object.assign(
      {},
      constraints,
      { video: compactObject(constraints.video) }
    );
  }
  return constraints;
}
function shimRTCIceServerUrls(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const OrigPeerConnection = window2.RTCPeerConnection;
  window2.RTCPeerConnection = function RTCPeerConnection2(pcConfig, pcConstraints) {
    if (pcConfig && pcConfig.iceServers) {
      const newIceServers = [];
      for (let i = 0; i < pcConfig.iceServers.length; i++) {
        let server = pcConfig.iceServers[i];
        if (server.urls === void 0 && server.url) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
          server = JSON.parse(JSON.stringify(server));
          server.urls = server.url;
          delete server.url;
          newIceServers.push(server);
        } else {
          newIceServers.push(pcConfig.iceServers[i]);
        }
      }
      pcConfig.iceServers = newIceServers;
    }
    return new OrigPeerConnection(pcConfig, pcConstraints);
  };
  window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  if ("generateCertificate" in OrigPeerConnection) {
    Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}
function shimTrackEventTransceiver(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimCreateOfferLegacy(window2) {
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
    if (offerOptions) {
      if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
        offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
      }
      const audioTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "audio");
      if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
        if (audioTransceiver.direction === "sendrecv") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("sendonly");
          } else {
            audioTransceiver.direction = "sendonly";
          }
        } else if (audioTransceiver.direction === "recvonly") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
        this.addTransceiver("audio", { direction: "recvonly" });
      }
      if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
        offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
      }
      const videoTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "video");
      if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
        if (videoTransceiver.direction === "sendrecv") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("sendonly");
          } else {
            videoTransceiver.direction = "sendonly";
          }
        } else if (videoTransceiver.direction === "recvonly") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
        this.addTransceiver("video", { direction: "recvonly" });
      }
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimAudioContext(window2) {
  if (typeof window2 !== "object" || window2.AudioContext) {
    return;
  }
  window2.AudioContext = window2.webkitAudioContext;
}

// node_modules/webrtc-adapter/src/js/common_shim.js
var common_shim_exports = {};
__export(common_shim_exports, {
  removeExtmapAllowMixed: () => removeExtmapAllowMixed,
  shimAddIceCandidateNullOrEmpty: () => shimAddIceCandidateNullOrEmpty,
  shimConnectionState: () => shimConnectionState,
  shimMaxMessageSize: () => shimMaxMessageSize,
  shimParameterlessSetLocalDescription: () => shimParameterlessSetLocalDescription,
  shimRTCIceCandidate: () => shimRTCIceCandidate,
  shimRTCIceCandidateRelayProtocol: () => shimRTCIceCandidateRelayProtocol,
  shimSendThrowTypeError: () => shimSendThrowTypeError
});
var import_sdp = __toESM(require_sdp());
function shimRTCIceCandidate(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "foundation" in window2.RTCIceCandidate.prototype) {
    return;
  }
  const NativeRTCIceCandidate = window2.RTCIceCandidate;
  window2.RTCIceCandidate = function RTCIceCandidate(args) {
    if (typeof args === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substring(2);
    }
    if (args.candidate && args.candidate.length) {
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = import_sdp.default.parseCandidate(args.candidate);
      for (const key in parsedCandidate) {
        if (!(key in nativeCandidate)) {
          Object.defineProperty(
            nativeCandidate,
            key,
            { value: parsedCandidate[key] }
          );
        }
      }
      nativeCandidate.toJSON = function toJSON() {
        return {
          candidate: nativeCandidate.candidate,
          sdpMid: nativeCandidate.sdpMid,
          sdpMLineIndex: nativeCandidate.sdpMLineIndex,
          usernameFragment: nativeCandidate.usernameFragment
        };
      };
      return nativeCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      Object.defineProperty(e, "candidate", {
        value: new window2.RTCIceCandidate(e.candidate),
        writable: "false"
      });
    }
    return e;
  });
}
function shimRTCIceCandidateRelayProtocol(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "relayProtocol" in window2.RTCIceCandidate.prototype) {
    return;
  }
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      const parsedCandidate = import_sdp.default.parseCandidate(e.candidate.candidate);
      if (parsedCandidate.type === "relay") {
        e.candidate.relayProtocol = {
          0: "tls",
          1: "tcp",
          2: "udp"
        }[parsedCandidate.priority >> 24];
      }
    }
    return e;
  });
}
function shimMaxMessageSize(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (!("sctp" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
      get() {
        return typeof this._sctp === "undefined" ? null : this._sctp;
      }
    });
  }
  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = import_sdp.default.splitSections(description.sdp);
    sections.shift();
    return sections.some((mediaSection) => {
      const mLine = import_sdp.default.parseMLine(mediaSection);
      return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
    });
  };
  const getRemoteFirefoxVersion = function(description) {
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    return version !== version ? -1 : version;
  };
  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === "firefox") {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          canSendMaxMessageSize = 16384;
        } else {
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
      } else {
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };
  const getMaxMessageSize = function(description, remoteIsFirefox) {
    let maxMessageSize = 65536;
    if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }
    const match = import_sdp.default.matchPrefix(
      description.sdp,
      "a=max-message-size:"
    );
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substring(19), 10);
    } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };
  const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
    this._sctp = null;
    if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
      const { sdpSemantics } = this.getConfiguration();
      if (sdpSemantics === "plan-b") {
        Object.defineProperty(this, "sctp", {
          get() {
            return typeof this._sctp === "undefined" ? null : this._sctp;
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    if (sctpInDescription(arguments[0])) {
      const isFirefox = getRemoteFirefoxVersion(arguments[0]);
      const canSendMMS = getCanSendMaxMessageSize(isFirefox);
      const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
      let maxMessageSize;
      if (canSendMMS === 0 && remoteMMS === 0) {
        maxMessageSize = Number.POSITIVE_INFINITY;
      } else if (canSendMMS === 0 || remoteMMS === 0) {
        maxMessageSize = Math.max(canSendMMS, remoteMMS);
      } else {
        maxMessageSize = Math.min(canSendMMS, remoteMMS);
      }
      const sctp = {};
      Object.defineProperty(sctp, "maxMessageSize", {
        get() {
          return maxMessageSize;
        }
      });
      this._sctp = sctp;
    }
    return origSetRemoteDescription.apply(this, arguments);
  };
}
function shimSendThrowTypeError(window2) {
  if (!(window2.RTCPeerConnection && "createDataChannel" in window2.RTCPeerConnection.prototype)) {
    return;
  }
  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
  window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
    const dataChannel = origCreateDataChannel.apply(this, arguments);
    wrapDcSend(dataChannel, this);
    return dataChannel;
  };
  wrapPeerConnectionEvent(window2, "datachannel", (e) => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}
function shimConnectionState(window2) {
  if (!window2.RTCPeerConnection || "connectionState" in window2.RTCPeerConnection.prototype) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  Object.defineProperty(proto, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener(
          "connectionstatechange",
          this._onconnectionstatechange
        );
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener(
          "connectionstatechange",
          this._onconnectionstatechange = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
  ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = (e) => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event("connectionstatechange", e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener(
          "iceconnectionstatechange",
          this._connectionstatechangepoly
        );
      }
      return origMethod.apply(this, arguments);
    };
  });
}
function removeExtmapAllowMixed(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === "safari" && browserDetails.version >= 605) {
    return;
  }
  const nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
      const sdp2 = desc.sdp.split("\n").filter((line) => {
        return line.trim() !== "a=extmap-allow-mixed";
      }).join("\n");
      if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
        arguments[0] = new window2.RTCSessionDescription({
          type: desc.type,
          sdp: sdp2
        });
      } else {
        desc.sdp = sdp2;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}
function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
    if (!arguments[0]) {
      if (arguments[1]) {
        arguments[1].apply(null);
      }
      return Promise.resolve();
    }
    if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
      return Promise.resolve();
    }
    return nativeAddIceCandidate.apply(this, arguments);
  };
}
function shimParameterlessSetLocalDescription(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    let desc = arguments[0] || {};
    if (typeof desc !== "object" || desc.type && desc.sdp) {
      return nativeSetLocalDescription.apply(this, arguments);
    }
    desc = { type: desc.type, sdp: desc.sdp };
    if (!desc.type) {
      switch (this.signalingState) {
        case "stable":
        case "have-local-offer":
        case "have-remote-pranswer":
          desc.type = "offer";
          break;
        default:
          desc.type = "answer";
          break;
      }
    }
    if (desc.sdp || desc.type !== "offer" && desc.type !== "answer") {
      return nativeSetLocalDescription.apply(this, [desc]);
    }
    const func = desc.type === "offer" ? this.createOffer : this.createAnswer;
    return func.apply(this).then((d) => nativeSetLocalDescription.apply(this, [d]));
  };
}

// node_modules/webrtc-adapter/src/js/adapter_factory.js
var sdp = __toESM(require_sdp());
function adapterFactory({ window: window2 } = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true
}) {
  const logging2 = log2;
  const browserDetails = detectBrowser(window2);
  const adapter2 = {
    browserDetails,
    commonShim: common_shim_exports,
    extractVersion,
    disableLog,
    disableWarnings,
    // Expose sdp as a convenience. For production apps include directly.
    sdp
  };
  switch (browserDetails.browser) {
    case "chrome":
      if (!chrome_shim_exports || !shimPeerConnection || !options.shimChrome) {
        logging2("Chrome shim is not included in this adapter release.");
        return adapter2;
      }
      if (browserDetails.version === null) {
        logging2("Chrome shim can not determine version, not shimming.");
        return adapter2;
      }
      logging2("adapter.js shimming chrome.");
      adapter2.browserShim = chrome_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia(window2, browserDetails);
      shimMediaStream(window2, browserDetails);
      shimPeerConnection(window2, browserDetails);
      shimOnTrack(window2, browserDetails);
      shimAddTrackRemoveTrack(window2, browserDetails);
      shimGetSendersWithDtmf(window2, browserDetails);
      shimSenderReceiverGetStats(window2, browserDetails);
      fixNegotiationNeeded(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    case "firefox":
      if (!firefox_shim_exports || !shimPeerConnection2 || !options.shimFirefox) {
        logging2("Firefox shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming firefox.");
      adapter2.browserShim = firefox_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia2(window2, browserDetails);
      shimPeerConnection2(window2, browserDetails);
      shimOnTrack2(window2, browserDetails);
      shimRemoveStream(window2, browserDetails);
      shimSenderGetStats(window2, browserDetails);
      shimReceiverGetStats(window2, browserDetails);
      shimRTCDataChannel(window2, browserDetails);
      shimAddTransceiver(window2, browserDetails);
      shimGetParameters(window2, browserDetails);
      shimCreateOffer(window2, browserDetails);
      shimCreateAnswer(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      break;
    case "safari":
      if (!safari_shim_exports || !options.shimSafari) {
        logging2("Safari shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming safari.");
      adapter2.browserShim = safari_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimRTCIceServerUrls(window2, browserDetails);
      shimCreateOfferLegacy(window2, browserDetails);
      shimCallbacksAPI(window2, browserDetails);
      shimLocalStreamsAPI(window2, browserDetails);
      shimRemoteStreamsAPI(window2, browserDetails);
      shimTrackEventTransceiver(window2, browserDetails);
      shimGetUserMedia3(window2, browserDetails);
      shimAudioContext(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    default:
      logging2("Unsupported browser!");
      break;
  }
  return adapter2;
}

// node_modules/webrtc-adapter/src/js/adapter_core.js
var adapter = adapterFactory({ window: typeof window === "undefined" ? void 0 : window });
var adapter_core_default = adapter;

// node_modules/peerjs/dist/bundler.mjs
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
}
var $fcbcc7538a6776d5$export$f1c5f4c9cb95390b = class {
  constructor() {
    this.chunkedMTU = 16300;
    this._dataCount = 1;
    this.chunk = (blob) => {
      const chunks = [];
      const size = blob.byteLength;
      const total = Math.ceil(size / this.chunkedMTU);
      let index = 0;
      let start = 0;
      while (start < size) {
        const end = Math.min(size, start + this.chunkedMTU);
        const b = blob.slice(start, end);
        const chunk = {
          __peerData: this._dataCount,
          n: index,
          data: b,
          total
        };
        chunks.push(chunk);
        start = end;
        index++;
      }
      this._dataCount++;
      return chunks;
    };
  }
};
function $fcbcc7538a6776d5$export$52c89ebcdc4f53f2(bufs) {
  let size = 0;
  for (const buf of bufs)
    size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    result.set(buf, offset);
    offset += buf.byteLength;
  }
  return result;
}
var $fb63e766cfafaab9$var$webRTCAdapter = (
  //@ts-ignore
  (0, adapter_core_default).default || (0, adapter_core_default)
);
var $fb63e766cfafaab9$export$25be9502477c137d = new class {
  isWebRTCSupported() {
    return typeof RTCPeerConnection !== "undefined";
  }
  isBrowserSupported() {
    const browser = this.getBrowser();
    const version = this.getVersion();
    const validBrowser = this.supportedBrowsers.includes(browser);
    if (!validBrowser)
      return false;
    if (browser === "chrome")
      return version >= this.minChromeVersion;
    if (browser === "firefox")
      return version >= this.minFirefoxVersion;
    if (browser === "safari")
      return !this.isIOS && version >= this.minSafariVersion;
    return false;
  }
  getBrowser() {
    return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.browser;
  }
  getVersion() {
    return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
  }
  isUnifiedPlanSupported() {
    const browser = this.getBrowser();
    const version = $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
    if (browser === "chrome" && version < this.minChromeVersion)
      return false;
    if (browser === "firefox" && version >= this.minFirefoxVersion)
      return true;
    if (!window.RTCRtpTransceiver || !("currentDirection" in RTCRtpTransceiver.prototype))
      return false;
    let tempPc;
    let supported = false;
    try {
      tempPc = new RTCPeerConnection();
      tempPc.addTransceiver("audio");
      supported = true;
    } catch (e) {
    } finally {
      if (tempPc)
        tempPc.close();
    }
    return supported;
  }
  toString() {
    return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
  }
  constructor() {
    this.isIOS = typeof navigator !== "undefined" ? [
      "iPad",
      "iPhone",
      "iPod"
    ].includes(navigator.platform) : false;
    this.supportedBrowsers = [
      "firefox",
      "chrome",
      "safari"
    ];
    this.minFirefoxVersion = 59;
    this.minChromeVersion = 72;
    this.minSafariVersion = 605;
  }
}();
var $9a84a32bf0bf36bb$export$f35f128fd59ea256 = (id) => {
  return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
};
var $0e5fd1585784c252$export$4e61f672936bec77 = () => Math.random().toString(36).slice(2);
var $4f4134156c446392$var$DEFAULT_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
      urls: [
        "turn:eu-0.turn.peerjs.com:3478",
        "turn:us-0.turn.peerjs.com:3478"
      ],
      username: "peerjs",
      credential: "peerjsp"
    }
  ],
  sdpSemantics: "unified-plan"
};
var $4f4134156c446392$export$f8f26dd395d7e1bd = class extends (0, $fcbcc7538a6776d5$export$f1c5f4c9cb95390b) {
  noop() {
  }
  blobToArrayBuffer(blob, cb) {
    const fr = new FileReader();
    fr.onload = function(evt) {
      if (evt.target)
        cb(evt.target.result);
    };
    fr.readAsArrayBuffer(blob);
    return fr;
  }
  binaryStringToArrayBuffer(binary) {
    const byteArray = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++)
      byteArray[i] = binary.charCodeAt(i) & 255;
    return byteArray.buffer;
  }
  isSecure() {
    return location.protocol === "https:";
  }
  constructor(...args) {
    super(...args);
    this.CLOUD_HOST = "0.peerjs.com";
    this.CLOUD_PORT = 443;
    this.chunkedBrowsers = {
      Chrome: 1,
      chrome: 1
    };
    this.defaultConfig = $4f4134156c446392$var$DEFAULT_CONFIG;
    this.browser = (0, $fb63e766cfafaab9$export$25be9502477c137d).getBrowser();
    this.browserVersion = (0, $fb63e766cfafaab9$export$25be9502477c137d).getVersion();
    this.pack = $0cfd7828ad59115f$export$2a703dbb0cb35339;
    this.unpack = $0cfd7828ad59115f$export$417857010dc9287f;
    this.supports = function() {
      const supported = {
        browser: (0, $fb63e766cfafaab9$export$25be9502477c137d).isBrowserSupported(),
        webRTC: (0, $fb63e766cfafaab9$export$25be9502477c137d).isWebRTCSupported(),
        audioVideo: false,
        data: false,
        binaryBlob: false,
        reliable: false
      };
      if (!supported.webRTC)
        return supported;
      let pc;
      try {
        pc = new RTCPeerConnection($4f4134156c446392$var$DEFAULT_CONFIG);
        supported.audioVideo = true;
        let dc;
        try {
          dc = pc.createDataChannel("_PEERJSTEST", {
            ordered: true
          });
          supported.data = true;
          supported.reliable = !!dc.ordered;
          try {
            dc.binaryType = "blob";
            supported.binaryBlob = !(0, $fb63e766cfafaab9$export$25be9502477c137d).isIOS;
          } catch (e) {
          }
        } catch (e) {
        } finally {
          if (dc)
            dc.close();
        }
      } catch (e) {
      } finally {
        if (pc)
          pc.close();
      }
      return supported;
    }();
    this.validateId = (0, $9a84a32bf0bf36bb$export$f35f128fd59ea256);
    this.randomToken = (0, $0e5fd1585784c252$export$4e61f672936bec77);
  }
};
var $4f4134156c446392$export$7debb50ef11d5e0b = new $4f4134156c446392$export$f8f26dd395d7e1bd();
var $257947e92926277a$var$LOG_PREFIX = "PeerJS: ";
var $257947e92926277a$export$243e62d78d3b544d;
(function(LogLevel) {
  LogLevel[LogLevel["Disabled"] = 0] = "Disabled";
  LogLevel[LogLevel["Errors"] = 1] = "Errors";
  LogLevel[LogLevel["Warnings"] = 2] = "Warnings";
  LogLevel[LogLevel["All"] = 3] = "All";
})($257947e92926277a$export$243e62d78d3b544d || ($257947e92926277a$export$243e62d78d3b544d = {}));
var $257947e92926277a$var$Logger = class {
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(logLevel) {
    this._logLevel = logLevel;
  }
  log(...args) {
    if (this._logLevel >= 3)
      this._print(3, ...args);
  }
  warn(...args) {
    if (this._logLevel >= 2)
      this._print(2, ...args);
  }
  error(...args) {
    if (this._logLevel >= 1)
      this._print(1, ...args);
  }
  setLogFunction(fn) {
    this._print = fn;
  }
  _print(logLevel, ...rest) {
    const copy = [
      $257947e92926277a$var$LOG_PREFIX,
      ...rest
    ];
    for (const i in copy)
      if (copy[i] instanceof Error)
        copy[i] = "(" + copy[i].name + ") " + copy[i].message;
    if (logLevel >= 3)
      console.log(...copy);
    else if (logLevel >= 2)
      console.warn("WARNING", ...copy);
    else if (logLevel >= 1)
      console.error("ERROR", ...copy);
  }
  constructor() {
    this._logLevel = 0;
  }
};
var $257947e92926277a$export$2e2bcd8739ae039 = new $257947e92926277a$var$Logger();
var $c4dcfd1d1ea86647$exports = {};
var $c4dcfd1d1ea86647$var$has = Object.prototype.hasOwnProperty;
var $c4dcfd1d1ea86647$var$prefix = "~";
function $c4dcfd1d1ea86647$var$Events() {
}
if (Object.create) {
  $c4dcfd1d1ea86647$var$Events.prototype = /* @__PURE__ */ Object.create(null);
  if (!new $c4dcfd1d1ea86647$var$Events().__proto__)
    $c4dcfd1d1ea86647$var$prefix = false;
}
function $c4dcfd1d1ea86647$var$EE(fn, context, once2) {
  this.fn = fn;
  this.context = context;
  this.once = once2 || false;
}
function $c4dcfd1d1ea86647$var$addListener(emitter, event, fn, context, once2) {
  if (typeof fn !== "function")
    throw new TypeError("The listener must be a function");
  var listener = new $c4dcfd1d1ea86647$var$EE(fn, context || emitter, once2), evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
  if (!emitter._events[evt])
    emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn)
    emitter._events[evt].push(listener);
  else
    emitter._events[evt] = [
      emitter._events[evt],
      listener
    ];
  return emitter;
}
function $c4dcfd1d1ea86647$var$clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0)
    emitter._events = new $c4dcfd1d1ea86647$var$Events();
  else
    delete emitter._events[evt];
}
function $c4dcfd1d1ea86647$var$EventEmitter() {
  this._events = new $c4dcfd1d1ea86647$var$Events();
  this._eventsCount = 0;
}
$c4dcfd1d1ea86647$var$EventEmitter.prototype.eventNames = function eventNames() {
  var names = [], events, name;
  if (this._eventsCount === 0)
    return names;
  for (name in events = this._events)
    if ($c4dcfd1d1ea86647$var$has.call(events, name))
      names.push($c4dcfd1d1ea86647$var$prefix ? name.slice(1) : name);
  if (Object.getOwnPropertySymbols)
    return names.concat(Object.getOwnPropertySymbols(events));
  return names;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listeners = function listeners(event) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event, handlers = this._events[evt];
  if (!handlers)
    return [];
  if (handlers.fn)
    return [
      handlers.fn
    ];
  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++)
    ee[i] = handlers[i].fn;
  return ee;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event, listeners2 = this._events[evt];
  if (!listeners2)
    return 0;
  if (listeners2.fn)
    return 1;
  return listeners2.length;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
  if (!this._events[evt])
    return false;
  var listeners2 = this._events[evt], len = arguments.length, args, i;
  if (listeners2.fn) {
    if (listeners2.once)
      this.removeListener(event, listeners2.fn, void 0, true);
    switch (len) {
      case 1:
        return listeners2.fn.call(listeners2.context), true;
      case 2:
        return listeners2.fn.call(listeners2.context, a1), true;
      case 3:
        return listeners2.fn.call(listeners2.context, a1, a2), true;
      case 4:
        return listeners2.fn.call(listeners2.context, a1, a2, a3), true;
      case 5:
        return listeners2.fn.call(listeners2.context, a1, a2, a3, a4), true;
      case 6:
        return listeners2.fn.call(listeners2.context, a1, a2, a3, a4, a5), true;
    }
    for (i = 1, args = new Array(len - 1); i < len; i++)
      args[i - 1] = arguments[i];
    listeners2.fn.apply(listeners2.context, args);
  } else {
    var length = listeners2.length, j;
    for (i = 0; i < length; i++) {
      if (listeners2[i].once)
        this.removeListener(event, listeners2[i].fn, void 0, true);
      switch (len) {
        case 1:
          listeners2[i].fn.call(listeners2[i].context);
          break;
        case 2:
          listeners2[i].fn.call(listeners2[i].context, a1);
          break;
        case 3:
          listeners2[i].fn.call(listeners2[i].context, a1, a2);
          break;
        case 4:
          listeners2[i].fn.call(listeners2[i].context, a1, a2, a3);
          break;
        default:
          if (!args)
            for (j = 1, args = new Array(len - 1); j < len; j++)
              args[j - 1] = arguments[j];
          listeners2[i].fn.apply(listeners2[i].context, args);
      }
    }
  }
  return true;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.on = function on(event, fn, context) {
  return $c4dcfd1d1ea86647$var$addListener(this, event, fn, context, false);
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.once = function once(event, fn, context) {
  return $c4dcfd1d1ea86647$var$addListener(this, event, fn, context, true);
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once2) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
  if (!this._events[evt])
    return this;
  if (!fn) {
    $c4dcfd1d1ea86647$var$clearEvent(this, evt);
    return this;
  }
  var listeners2 = this._events[evt];
  if (listeners2.fn) {
    if (listeners2.fn === fn && (!once2 || listeners2.once) && (!context || listeners2.context === context))
      $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  } else {
    for (var i = 0, events = [], length = listeners2.length; i < length; i++)
      if (listeners2[i].fn !== fn || once2 && !listeners2[i].once || context && listeners2[i].context !== context)
        events.push(listeners2[i]);
    if (events.length)
      this._events[evt] = events.length === 1 ? events[0] : events;
    else
      $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  }
  return this;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;
  if (event) {
    evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
    if (this._events[evt])
      $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  } else {
    this._events = new $c4dcfd1d1ea86647$var$Events();
    this._eventsCount = 0;
  }
  return this;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.off = $c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener;
$c4dcfd1d1ea86647$var$EventEmitter.prototype.addListener = $c4dcfd1d1ea86647$var$EventEmitter.prototype.on;
$c4dcfd1d1ea86647$var$EventEmitter.prefixed = $c4dcfd1d1ea86647$var$prefix;
$c4dcfd1d1ea86647$var$EventEmitter.EventEmitter = $c4dcfd1d1ea86647$var$EventEmitter;
$c4dcfd1d1ea86647$exports = $c4dcfd1d1ea86647$var$EventEmitter;
var $78455e22dea96b8c$exports = {};
$parcel$export($78455e22dea96b8c$exports, "ConnectionType", () => $78455e22dea96b8c$export$3157d57b4135e3bc);
$parcel$export($78455e22dea96b8c$exports, "PeerErrorType", () => $78455e22dea96b8c$export$9547aaa2e39030ff);
$parcel$export($78455e22dea96b8c$exports, "BaseConnectionErrorType", () => $78455e22dea96b8c$export$7974935686149686);
$parcel$export($78455e22dea96b8c$exports, "DataConnectionErrorType", () => $78455e22dea96b8c$export$49ae800c114df41d);
$parcel$export($78455e22dea96b8c$exports, "SerializationType", () => $78455e22dea96b8c$export$89f507cf986a947);
$parcel$export($78455e22dea96b8c$exports, "SocketEventType", () => $78455e22dea96b8c$export$3b5c4a4b6354f023);
$parcel$export($78455e22dea96b8c$exports, "ServerMessageType", () => $78455e22dea96b8c$export$adb4a1754da6f10d);
var $78455e22dea96b8c$export$3157d57b4135e3bc;
(function(ConnectionType) {
  ConnectionType["Data"] = "data";
  ConnectionType["Media"] = "media";
})($78455e22dea96b8c$export$3157d57b4135e3bc || ($78455e22dea96b8c$export$3157d57b4135e3bc = {}));
var $78455e22dea96b8c$export$9547aaa2e39030ff;
(function(PeerErrorType) {
  PeerErrorType["BrowserIncompatible"] = "browser-incompatible";
  PeerErrorType["Disconnected"] = "disconnected";
  PeerErrorType["InvalidID"] = "invalid-id";
  PeerErrorType["InvalidKey"] = "invalid-key";
  PeerErrorType["Network"] = "network";
  PeerErrorType["PeerUnavailable"] = "peer-unavailable";
  PeerErrorType["SslUnavailable"] = "ssl-unavailable";
  PeerErrorType["ServerError"] = "server-error";
  PeerErrorType["SocketError"] = "socket-error";
  PeerErrorType["SocketClosed"] = "socket-closed";
  PeerErrorType["UnavailableID"] = "unavailable-id";
  PeerErrorType["WebRTC"] = "webrtc";
})($78455e22dea96b8c$export$9547aaa2e39030ff || ($78455e22dea96b8c$export$9547aaa2e39030ff = {}));
var $78455e22dea96b8c$export$7974935686149686;
(function(BaseConnectionErrorType) {
  BaseConnectionErrorType["NegotiationFailed"] = "negotiation-failed";
  BaseConnectionErrorType["ConnectionClosed"] = "connection-closed";
})($78455e22dea96b8c$export$7974935686149686 || ($78455e22dea96b8c$export$7974935686149686 = {}));
var $78455e22dea96b8c$export$49ae800c114df41d;
(function(DataConnectionErrorType) {
  DataConnectionErrorType["NotOpenYet"] = "not-open-yet";
  DataConnectionErrorType["MessageToBig"] = "message-too-big";
})($78455e22dea96b8c$export$49ae800c114df41d || ($78455e22dea96b8c$export$49ae800c114df41d = {}));
var $78455e22dea96b8c$export$89f507cf986a947;
(function(SerializationType) {
  SerializationType["Binary"] = "binary";
  SerializationType["BinaryUTF8"] = "binary-utf8";
  SerializationType["JSON"] = "json";
  SerializationType["None"] = "raw";
})($78455e22dea96b8c$export$89f507cf986a947 || ($78455e22dea96b8c$export$89f507cf986a947 = {}));
var $78455e22dea96b8c$export$3b5c4a4b6354f023;
(function(SocketEventType) {
  SocketEventType["Message"] = "message";
  SocketEventType["Disconnected"] = "disconnected";
  SocketEventType["Error"] = "error";
  SocketEventType["Close"] = "close";
})($78455e22dea96b8c$export$3b5c4a4b6354f023 || ($78455e22dea96b8c$export$3b5c4a4b6354f023 = {}));
var $78455e22dea96b8c$export$adb4a1754da6f10d;
(function(ServerMessageType) {
  ServerMessageType["Heartbeat"] = "HEARTBEAT";
  ServerMessageType["Candidate"] = "CANDIDATE";
  ServerMessageType["Offer"] = "OFFER";
  ServerMessageType["Answer"] = "ANSWER";
  ServerMessageType["Open"] = "OPEN";
  ServerMessageType["Error"] = "ERROR";
  ServerMessageType["IdTaken"] = "ID-TAKEN";
  ServerMessageType["InvalidKey"] = "INVALID-KEY";
  ServerMessageType["Leave"] = "LEAVE";
  ServerMessageType["Expire"] = "EXPIRE";
})($78455e22dea96b8c$export$adb4a1754da6f10d || ($78455e22dea96b8c$export$adb4a1754da6f10d = {}));
var $f5f881ec4575f1fc$exports = {};
$f5f881ec4575f1fc$exports = JSON.parse('{"name":"peerjs","version":"1.5.4","keywords":["peerjs","webrtc","p2p","rtc"],"description":"PeerJS client","homepage":"https://peerjs.com","bugs":{"url":"https://github.com/peers/peerjs/issues"},"repository":{"type":"git","url":"https://github.com/peers/peerjs"},"license":"MIT","contributors":["Michelle Bu <michelle@michellebu.com>","afrokick <devbyru@gmail.com>","ericz <really.ez@gmail.com>","Jairo <kidandcat@gmail.com>","Jonas Gloning <34194370+jonasgloning@users.noreply.github.com>","Jairo Caro-Accino Viciana <jairo@galax.be>","Carlos Caballero <carlos.caballero.gonzalez@gmail.com>","hc <hheennrryy@gmail.com>","Muhammad Asif <capripio@gmail.com>","PrashoonB <prashoonbhattacharjee@gmail.com>","Harsh Bardhan Mishra <47351025+HarshCasper@users.noreply.github.com>","akotynski <aleksanderkotbury@gmail.com>","lmb <i@lmb.io>","Jairooo <jairocaro@msn.com>","Moritz St\xFCckler <moritz.stueckler@gmail.com>","Simon <crydotsnakegithub@gmail.com>","Denis Lukov <denismassters@gmail.com>","Philipp Hancke <fippo@andyet.net>","Hans Oksendahl <hansoksendahl@gmail.com>","Jess <jessachandler@gmail.com>","khankuan <khankuan@gmail.com>","DUODVK <kurmanov.work@gmail.com>","XiZhao <kwang1imsa@gmail.com>","Matthias Lohr <matthias@lohr.me>","=frank tree <=frnktrb@googlemail.com>","Andre Eckardt <aeckardt@outlook.com>","Chris Cowan <agentme49@gmail.com>","Alex Chuev <alex@chuev.com>","alxnull <alxnull@e.mail.de>","Yemel Jardi <angel.jardi@gmail.com>","Ben Parnell <benjaminparnell.94@gmail.com>","Benny Lichtner <bennlich@gmail.com>","fresheneesz <bitetrudpublic@gmail.com>","bob.barstead@exaptive.com <bob.barstead@exaptive.com>","chandika <chandika@gmail.com>","emersion <contact@emersion.fr>","Christopher Van <cvan@users.noreply.github.com>","eddieherm <edhermoso@gmail.com>","Eduardo Pinho <enet4mikeenet@gmail.com>","Evandro Zanatta <ezanatta@tray.net.br>","Gardner Bickford <gardner@users.noreply.github.com>","Gian Luca <gianluca.cecchi@cynny.com>","PatrickJS <github@gdi2290.com>","jonnyf <github@jonathanfoss.co.uk>","Hizkia Felix <hizkifw@gmail.com>","Hristo Oskov <hristo.oskov@gmail.com>","Isaac Madwed <i.madwed@gmail.com>","Ilya Konanykhin <ilya.konanykhin@gmail.com>","jasonbarry <jasbarry@me.com>","Jonathan Burke <jonathan.burke.1311@googlemail.com>","Josh Hamit <josh.hamit@gmail.com>","Jordan Austin <jrax86@gmail.com>","Joel Wetzell <jwetzell@yahoo.com>","xizhao <kevin.wang@cloudera.com>","Alberto Torres <kungfoobar@gmail.com>","Jonathan Mayol <mayoljonathan@gmail.com>","Jefferson Felix <me@jsfelix.dev>","Rolf Erik Lekang <me@rolflekang.com>","Kevin Mai-Husan Chia <mhchia@users.noreply.github.com>","Pepijn de Vos <pepijndevos@gmail.com>","JooYoung <qkdlql@naver.com>","Tobias Speicher <rootcommander@gmail.com>","Steve Blaurock <sblaurock@gmail.com>","Kyrylo Shegeda <shegeda@ualberta.ca>","Diwank Singh Tomer <singh@diwank.name>","So\u0308ren Balko <Soeren.Balko@gmail.com>","Arpit Solanki <solankiarpit1997@gmail.com>","Yuki Ito <yuki@gnnk.net>","Artur Zayats <zag2art@gmail.com>"],"funding":{"type":"opencollective","url":"https://opencollective.com/peer"},"collective":{"type":"opencollective","url":"https://opencollective.com/peer"},"files":["dist/*"],"sideEffects":["lib/global.ts","lib/supports.ts"],"main":"dist/bundler.cjs","module":"dist/bundler.mjs","browser-minified":"dist/peerjs.min.js","browser-unminified":"dist/peerjs.js","browser-minified-msgpack":"dist/serializer.msgpack.mjs","types":"dist/types.d.ts","engines":{"node":">= 14"},"targets":{"types":{"source":"lib/exports.ts"},"main":{"source":"lib/exports.ts","sourceMap":{"inlineSources":true}},"module":{"source":"lib/exports.ts","includeNodeModules":["eventemitter3"],"sourceMap":{"inlineSources":true}},"browser-minified":{"context":"browser","outputFormat":"global","optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-unminified":{"context":"browser","outputFormat":"global","optimize":false,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-minified-msgpack":{"context":"browser","outputFormat":"esmodule","isLibrary":true,"optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 102, safari >= 15"},"source":"lib/dataconnection/StreamConnection/MsgPack.ts"}},"scripts":{"contributors":"git-authors-cli --print=false && prettier --write package.json && git add package.json package-lock.json && git commit -m \\"chore(contributors): update and sort contributors list\\"","check":"tsc --noEmit && tsc -p e2e/tsconfig.json --noEmit","watch":"parcel watch","build":"rm -rf dist && parcel build","prepublishOnly":"npm run build","test":"jest","test:watch":"jest --watch","coverage":"jest --coverage --collectCoverageFrom=\\"./lib/**\\"","format":"prettier --write .","format:check":"prettier --check .","semantic-release":"semantic-release","e2e":"wdio run e2e/wdio.local.conf.ts","e2e:bstack":"wdio run e2e/wdio.bstack.conf.ts"},"devDependencies":{"@parcel/config-default":"^2.9.3","@parcel/packager-ts":"^2.9.3","@parcel/transformer-typescript-tsc":"^2.9.3","@parcel/transformer-typescript-types":"^2.9.3","@semantic-release/changelog":"^6.0.1","@semantic-release/git":"^10.0.1","@swc/core":"^1.3.27","@swc/jest":"^0.2.24","@types/jasmine":"^4.3.4","@wdio/browserstack-service":"^8.11.2","@wdio/cli":"^8.11.2","@wdio/globals":"^8.11.2","@wdio/jasmine-framework":"^8.11.2","@wdio/local-runner":"^8.11.2","@wdio/spec-reporter":"^8.11.2","@wdio/types":"^8.10.4","http-server":"^14.1.1","jest":"^29.3.1","jest-environment-jsdom":"^29.3.1","mock-socket":"^9.0.0","parcel":"^2.9.3","prettier":"^3.0.0","semantic-release":"^21.0.0","ts-node":"^10.9.1","typescript":"^5.0.0","wdio-geckodriver-service":"^5.0.1"},"dependencies":{"@msgpack/msgpack":"^2.8.0","eventemitter3":"^4.0.7","peerjs-js-binarypack":"^2.1.0","webrtc-adapter":"^9.0.0"},"alias":{"process":false,"buffer":false}}');
var $8f5bfa60836d261d$export$4798917dbf149b79 = class extends (0, $c4dcfd1d1ea86647$exports.EventEmitter) {
  constructor(secure, host, port, path, key, pingInterval = 5e3) {
    super();
    this.pingInterval = pingInterval;
    this._disconnected = true;
    this._messagesQueue = [];
    const wsProtocol = secure ? "wss://" : "ws://";
    this._baseUrl = wsProtocol + host + ":" + port + path + "peerjs?key=" + key;
  }
  start(id, token) {
    this._id = id;
    const wsUrl = `${this._baseUrl}&id=${id}&token=${token}`;
    if (!!this._socket || !this._disconnected)
      return;
    this._socket = new WebSocket(wsUrl + "&version=" + (0, $f5f881ec4575f1fc$exports.version));
    this._disconnected = false;
    this._socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Server message received:", data);
      } catch (e) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Invalid server message", event.data);
        return;
      }
      this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Message, data);
    };
    this._socket.onclose = (event) => {
      if (this._disconnected)
        return;
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Socket closed.", event);
      this._cleanup();
      this._disconnected = true;
      this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Disconnected);
    };
    this._socket.onopen = () => {
      if (this._disconnected)
        return;
      this._sendQueuedMessages();
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Socket open");
      this._scheduleHeartbeat();
    };
  }
  _scheduleHeartbeat() {
    this._wsPingTimer = setTimeout(() => {
      this._sendHeartbeat();
    }, this.pingInterval);
  }
  _sendHeartbeat() {
    if (!this._wsOpen()) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Cannot send heartbeat, because socket closed`);
      return;
    }
    const message = JSON.stringify({
      type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Heartbeat
    });
    this._socket.send(message);
    this._scheduleHeartbeat();
  }
  /** Is the websocket currently open? */
  _wsOpen() {
    return !!this._socket && this._socket.readyState === 1;
  }
  /** Send queued messages. */
  _sendQueuedMessages() {
    const copiedQueue = [
      ...this._messagesQueue
    ];
    this._messagesQueue = [];
    for (const message of copiedQueue)
      this.send(message);
  }
  /** Exposed send for DC & Peer. */
  send(data) {
    if (this._disconnected)
      return;
    if (!this._id) {
      this._messagesQueue.push(data);
      return;
    }
    if (!data.type) {
      this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Error, "Invalid message");
      return;
    }
    if (!this._wsOpen())
      return;
    const message = JSON.stringify(data);
    this._socket.send(message);
  }
  close() {
    if (this._disconnected)
      return;
    this._cleanup();
    this._disconnected = true;
  }
  _cleanup() {
    if (this._socket) {
      this._socket.onopen = this._socket.onmessage = this._socket.onclose = null;
      this._socket.close();
      this._socket = void 0;
    }
    clearTimeout(this._wsPingTimer);
  }
};
var $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a = class {
  constructor(connection) {
    this.connection = connection;
  }
  /** Returns a PeerConnection object set up correctly (for data, media). */
  startConnection(options) {
    const peerConnection = this._startPeerConnection();
    this.connection.peerConnection = peerConnection;
    if (this.connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media && options._stream)
      this._addTracksToConnection(options._stream, peerConnection);
    if (options.originator) {
      const dataConnection = this.connection;
      const config = {
        ordered: !!options.reliable
      };
      const dataChannel = peerConnection.createDataChannel(dataConnection.label, config);
      dataConnection._initializeDataChannel(dataChannel);
      this._makeOffer();
    } else
      this.handleSDP("OFFER", options.sdp);
  }
  /** Start a PC. */
  _startPeerConnection() {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Creating RTCPeerConnection.");
    const peerConnection = new RTCPeerConnection(this.connection.provider.options.config);
    this._setupListeners(peerConnection);
    return peerConnection;
  }
  /** Set up various WebRTC listeners. */
  _setupListeners(peerConnection) {
    const peerId = this.connection.peer;
    const connectionId = this.connection.connectionId;
    const connectionType = this.connection.type;
    const provider = this.connection.provider;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for ICE candidates.");
    peerConnection.onicecandidate = (evt) => {
      if (!evt.candidate || !evt.candidate.candidate)
        return;
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Received ICE candidates for ${peerId}:`, evt.candidate);
      provider.socket.send({
        type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate,
        payload: {
          candidate: evt.candidate,
          type: connectionType,
          connectionId
        },
        dst: peerId
      });
    };
    peerConnection.oniceconnectionstatechange = () => {
      switch (peerConnection.iceConnectionState) {
        case "failed":
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState is failed, closing connections to " + peerId);
          this.connection.emitError((0, $78455e22dea96b8c$export$7974935686149686).NegotiationFailed, "Negotiation of connection to " + peerId + " failed.");
          this.connection.close();
          break;
        case "closed":
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState is closed, closing connections to " + peerId);
          this.connection.emitError((0, $78455e22dea96b8c$export$7974935686149686).ConnectionClosed, "Connection to " + peerId + " closed.");
          this.connection.close();
          break;
        case "disconnected":
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState changed to disconnected on the connection with " + peerId);
          break;
        case "completed":
          peerConnection.onicecandidate = () => {
          };
          break;
      }
      this.connection.emit("iceStateChanged", peerConnection.iceConnectionState);
    };
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for data channel");
    peerConnection.ondatachannel = (evt) => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Received data channel");
      const dataChannel = evt.channel;
      const connection = provider.getConnection(peerId, connectionId);
      connection._initializeDataChannel(dataChannel);
    };
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for remote stream");
    peerConnection.ontrack = (evt) => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Received remote stream");
      const stream = evt.streams[0];
      const connection = provider.getConnection(peerId, connectionId);
      if (connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media) {
        const mediaConnection = connection;
        this._addStreamToMediaConnection(stream, mediaConnection);
      }
    };
  }
  cleanup() {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Cleaning up PeerConnection to " + this.connection.peer);
    const peerConnection = this.connection.peerConnection;
    if (!peerConnection)
      return;
    this.connection.peerConnection = null;
    peerConnection.onicecandidate = peerConnection.oniceconnectionstatechange = peerConnection.ondatachannel = peerConnection.ontrack = () => {
    };
    const peerConnectionNotClosed = peerConnection.signalingState !== "closed";
    let dataChannelNotClosed = false;
    const dataChannel = this.connection.dataChannel;
    if (dataChannel)
      dataChannelNotClosed = !!dataChannel.readyState && dataChannel.readyState !== "closed";
    if (peerConnectionNotClosed || dataChannelNotClosed)
      peerConnection.close();
  }
  async _makeOffer() {
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    try {
      const offer = await peerConnection.createOffer(this.connection.options.constraints);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created offer.");
      if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function")
        offer.sdp = this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
      try {
        await peerConnection.setLocalDescription(offer);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Set localDescription:", offer, `for:${this.connection.peer}`);
        let payload = {
          sdp: offer,
          type: this.connection.type,
          connectionId: this.connection.connectionId,
          metadata: this.connection.metadata
        };
        if (this.connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data) {
          const dataConnection = this.connection;
          payload = {
            ...payload,
            label: dataConnection.label,
            reliable: dataConnection.reliable,
            serialization: dataConnection.serialization
          };
        }
        provider.socket.send({
          type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Offer,
          payload,
          dst: this.connection.peer
        });
      } catch (err) {
        if (err != "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer") {
          provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
        }
      }
    } catch (err_1) {
      provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err_1);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to createOffer, ", err_1);
    }
  }
  async _makeAnswer() {
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    try {
      const answer = await peerConnection.createAnswer();
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created answer.");
      if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function")
        answer.sdp = this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
      try {
        await peerConnection.setLocalDescription(answer);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set localDescription:`, answer, `for:${this.connection.peer}`);
        provider.socket.send({
          type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer,
          payload: {
            sdp: answer,
            type: this.connection.type,
            connectionId: this.connection.connectionId
          },
          dst: this.connection.peer
        });
      } catch (err) {
        provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
      }
    } catch (err_1) {
      provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err_1);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to create answer, ", err_1);
    }
  }
  /** Handle an SDP. */
  async handleSDP(type, sdp2) {
    sdp2 = new RTCSessionDescription(sdp2);
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Setting remote description", sdp2);
    const self = this;
    try {
      await peerConnection.setRemoteDescription(sdp2);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set remoteDescription:${type} for:${this.connection.peer}`);
      if (type === "OFFER")
        await self._makeAnswer();
    } catch (err) {
      provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setRemoteDescription, ", err);
    }
  }
  /** Handle a candidate. */
  async handleCandidate(ice) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`handleCandidate:`, ice);
    try {
      await this.connection.peerConnection.addIceCandidate(ice);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Added ICE candidate for:${this.connection.peer}`);
    } catch (err) {
      this.connection.provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to handleCandidate, ", err);
    }
  }
  _addTracksToConnection(stream, peerConnection) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add tracks from stream ${stream.id} to peer connection`);
    if (!peerConnection.addTrack)
      return (0, $257947e92926277a$export$2e2bcd8739ae039).error(`Your browser does't support RTCPeerConnection#addTrack. Ignored.`);
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  }
  _addStreamToMediaConnection(stream, mediaConnection) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add stream ${stream.id} to media connection ${mediaConnection.connectionId}`);
    mediaConnection.addStream(stream);
  }
};
var $23779d1881157a18$export$6a678e589c8a4542 = class extends (0, $c4dcfd1d1ea86647$exports.EventEmitter) {
  /**
  * Emits a typed error message.
  *
  * @internal
  */
  emitError(type, err) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error:", err);
    this.emit("error", new $23779d1881157a18$export$98871882f492de82(`${type}`, err));
  }
};
var $23779d1881157a18$export$98871882f492de82 = class extends Error {
  /**
  * @internal
  */
  constructor(type, err) {
    if (typeof err === "string")
      super(err);
    else {
      super();
      Object.assign(this, err);
    }
    this.type = type;
  }
};
var $5045192fc6d387ba$export$23a2a68283c24d80 = class extends (0, $23779d1881157a18$export$6a678e589c8a4542) {
  /**
  * Whether the media connection is active (e.g. your call has been answered).
  * You can check this if you want to set a maximum wait time for a one-sided call.
  */
  get open() {
    return this._open;
  }
  constructor(peer, provider, options) {
    super();
    this.peer = peer;
    this.provider = provider;
    this.options = options;
    this._open = false;
    this.metadata = options.metadata;
  }
};
var $5c1d08c7c57da9a3$export$4a84e95a2324ac29 = class _$5c1d08c7c57da9a3$export$4a84e95a2324ac29 extends (0, $5045192fc6d387ba$export$23a2a68283c24d80) {
  static #_ = this.ID_PREFIX = "mc_";
  /**
  * For media connections, this is always 'media'.
  */
  get type() {
    return (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media;
  }
  get localStream() {
    return this._localStream;
  }
  get remoteStream() {
    return this._remoteStream;
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this._localStream = this.options._stream;
    this.connectionId = this.options.connectionId || _$5c1d08c7c57da9a3$export$4a84e95a2324ac29.ID_PREFIX + (0, $4f4134156c446392$export$7debb50ef11d5e0b).randomToken();
    this._negotiator = new (0, $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a)(this);
    if (this._localStream)
      this._negotiator.startConnection({
        _stream: this._localStream,
        originator: true
      });
  }
  /** Called by the Negotiator when the DataChannel is ready. */
  _initializeDataChannel(dc) {
    this.dataChannel = dc;
    this.dataChannel.onopen = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
      this.emit("willCloseOnRemote");
    };
    this.dataChannel.onclose = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
      this.close();
    };
  }
  addStream(remoteStream) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Receiving stream", remoteStream);
    this._remoteStream = remoteStream;
    super.emit("stream", remoteStream);
  }
  /**
  * @internal
  */
  handleMessage(message) {
    const type = message.type;
    const payload = message.payload;
    switch (message.type) {
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer:
        this._negotiator.handleSDP(type, payload.sdp);
        this._open = true;
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate:
        this._negotiator.handleCandidate(payload.candidate);
        break;
      default:
        (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Unrecognized message type:${type} from peer:${this.peer}`);
        break;
    }
  }
  /**
       * When receiving a {@apilink PeerEvents | `call`} event on a peer, you can call
       * `answer` on the media connection provided by the callback to accept the call
       * and optionally send your own media stream.
  
       *
       * @param stream A WebRTC media stream.
       * @param options
       * @returns
       */
  answer(stream, options = {}) {
    if (this._localStream) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
      return;
    }
    this._localStream = stream;
    if (options && options.sdpTransform)
      this.options.sdpTransform = options.sdpTransform;
    this._negotiator.startConnection({
      ...this.options._payload,
      _stream: stream
    });
    const messages = this.provider._getMessages(this.connectionId);
    for (const message of messages)
      this.handleMessage(message);
    this._open = true;
  }
  /**
  * Exposed functionality for users.
  */
  /**
  * Closes the media connection.
  */
  close() {
    if (this._negotiator) {
      this._negotiator.cleanup();
      this._negotiator = null;
    }
    this._localStream = null;
    this._remoteStream = null;
    if (this.provider) {
      this.provider._removeConnection(this);
      this.provider = null;
    }
    if (this.options && this.options._stream)
      this.options._stream = null;
    if (!this.open)
      return;
    this._open = false;
    super.emit("close");
  }
};
var $abf266641927cd89$export$2c4e825dc9120f87 = class {
  constructor(_options) {
    this._options = _options;
  }
  _buildRequest(method) {
    const protocol = this._options.secure ? "https" : "http";
    const { host, port, path, key } = this._options;
    const url = new URL(`${protocol}://${host}:${port}${path}${key}/${method}`);
    url.searchParams.set("ts", `${Date.now()}${Math.random()}`);
    url.searchParams.set("version", (0, $f5f881ec4575f1fc$exports.version));
    return fetch(url.href, {
      referrerPolicy: this._options.referrerPolicy
    });
  }
  /** Get a unique ID from the server via XHR and initialize with it. */
  async retrieveId() {
    try {
      const response = await this._buildRequest("id");
      if (response.status !== 200)
        throw new Error(`Error. Status:${response.status}`);
      return response.text();
    } catch (error) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error retrieving ID", error);
      let pathError = "";
      if (this._options.path === "/" && this._options.host !== (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
        pathError = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer.";
      throw new Error("Could not get an ID from the server." + pathError);
    }
  }
  /** @deprecated */
  async listAllPeers() {
    try {
      const response = await this._buildRequest("peers");
      if (response.status !== 200) {
        if (response.status === 401) {
          let helpfulError = "";
          if (this._options.host === (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
            helpfulError = "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.";
          else
            helpfulError = "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.";
          throw new Error("It doesn't look like you have permission to list peers IDs. " + helpfulError);
        }
        throw new Error(`Error. Status:${response.status}`);
      }
      return response.json();
    } catch (error) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error retrieving list peers", error);
      throw new Error("Could not get list peers from the server." + error);
    }
  }
};
var $6366c4ca161bc297$export$d365f7ad9d7df9c9 = class _$6366c4ca161bc297$export$d365f7ad9d7df9c9 extends (0, $5045192fc6d387ba$export$23a2a68283c24d80) {
  static #_ = this.ID_PREFIX = "dc_";
  static #_2 = this.MAX_BUFFERED_AMOUNT = 8388608;
  get type() {
    return (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data;
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this.connectionId = this.options.connectionId || _$6366c4ca161bc297$export$d365f7ad9d7df9c9.ID_PREFIX + (0, $0e5fd1585784c252$export$4e61f672936bec77)();
    this.label = this.options.label || this.connectionId;
    this.reliable = !!this.options.reliable;
    this._negotiator = new (0, $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a)(this);
    this._negotiator.startConnection(this.options._payload || {
      originator: true,
      reliable: this.reliable
    });
  }
  /** Called by the Negotiator when the DataChannel is ready. */
  _initializeDataChannel(dc) {
    this.dataChannel = dc;
    this.dataChannel.onopen = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
      this._open = true;
      this.emit("open");
    };
    this.dataChannel.onmessage = (e) => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc onmessage:`, e.data);
    };
    this.dataChannel.onclose = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
      this.close();
    };
  }
  /**
  * Exposed functionality for users.
  */
  /** Allows user to close connection. */
  close(options) {
    if (options?.flush) {
      this.send({
        __peerData: {
          type: "close"
        }
      });
      return;
    }
    if (this._negotiator) {
      this._negotiator.cleanup();
      this._negotiator = null;
    }
    if (this.provider) {
      this.provider._removeConnection(this);
      this.provider = null;
    }
    if (this.dataChannel) {
      this.dataChannel.onopen = null;
      this.dataChannel.onmessage = null;
      this.dataChannel.onclose = null;
      this.dataChannel = null;
    }
    if (!this.open)
      return;
    this._open = false;
    super.emit("close");
  }
  /** Allows user to send data. */
  send(data, chunked = false) {
    if (!this.open) {
      this.emitError((0, $78455e22dea96b8c$export$49ae800c114df41d).NotOpenYet, "Connection is not open. You should listen for the `open` event before sending messages.");
      return;
    }
    return this._send(data, chunked);
  }
  async handleMessage(message) {
    const payload = message.payload;
    switch (message.type) {
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer:
        await this._negotiator.handleSDP(message.type, payload.sdp);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate:
        await this._negotiator.handleCandidate(payload.candidate);
        break;
      default:
        (0, $257947e92926277a$export$2e2bcd8739ae039).warn("Unrecognized message type:", message.type, "from peer:", this.peer);
        break;
    }
  }
};
var $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b = class extends (0, $6366c4ca161bc297$export$d365f7ad9d7df9c9) {
  get bufferSize() {
    return this._bufferSize;
  }
  _initializeDataChannel(dc) {
    super._initializeDataChannel(dc);
    this.dataChannel.binaryType = "arraybuffer";
    this.dataChannel.addEventListener("message", (e) => this._handleDataMessage(e));
  }
  _bufferedSend(msg) {
    if (this._buffering || !this._trySend(msg)) {
      this._buffer.push(msg);
      this._bufferSize = this._buffer.length;
    }
  }
  // Returns true if the send succeeds.
  _trySend(msg) {
    if (!this.open)
      return false;
    if (this.dataChannel.bufferedAmount > (0, $6366c4ca161bc297$export$d365f7ad9d7df9c9).MAX_BUFFERED_AMOUNT) {
      this._buffering = true;
      setTimeout(() => {
        this._buffering = false;
        this._tryBuffer();
      }, 50);
      return false;
    }
    try {
      this.dataChannel.send(msg);
    } catch (e) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error(`DC#:${this.connectionId} Error when sending:`, e);
      this._buffering = true;
      this.close();
      return false;
    }
    return true;
  }
  // Try to send the first message in the buffer.
  _tryBuffer() {
    if (!this.open)
      return;
    if (this._buffer.length === 0)
      return;
    const msg = this._buffer[0];
    if (this._trySend(msg)) {
      this._buffer.shift();
      this._bufferSize = this._buffer.length;
      this._tryBuffer();
    }
  }
  close(options) {
    if (options?.flush) {
      this.send({
        __peerData: {
          type: "close"
        }
      });
      return;
    }
    this._buffer = [];
    this._bufferSize = 0;
    super.close();
  }
  constructor(...args) {
    super(...args);
    this._buffer = [];
    this._bufferSize = 0;
    this._buffering = false;
  }
};
var $9fcfddb3ae148f88$export$f0a5a64d5bb37108 = class extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
  close(options) {
    super.close(options);
    this._chunkedData = {};
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this.chunker = new (0, $fcbcc7538a6776d5$export$f1c5f4c9cb95390b)();
    this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).Binary;
    this._chunkedData = {};
  }
  // Handles a DataChannel message.
  _handleDataMessage({ data }) {
    const deserializedData = (0, $0cfd7828ad59115f$export$417857010dc9287f)(data);
    const peerData = deserializedData["__peerData"];
    if (peerData) {
      if (peerData.type === "close") {
        this.close();
        return;
      }
      this._handleChunk(deserializedData);
      return;
    }
    this.emit("data", deserializedData);
  }
  _handleChunk(data) {
    const id = data.__peerData;
    const chunkInfo = this._chunkedData[id] || {
      data: [],
      count: 0,
      total: data.total
    };
    chunkInfo.data[data.n] = new Uint8Array(data.data);
    chunkInfo.count++;
    this._chunkedData[id] = chunkInfo;
    if (chunkInfo.total === chunkInfo.count) {
      delete this._chunkedData[id];
      const data2 = (0, $fcbcc7538a6776d5$export$52c89ebcdc4f53f2)(chunkInfo.data);
      this._handleDataMessage({
        data: data2
      });
    }
  }
  _send(data, chunked) {
    const blob = (0, $0cfd7828ad59115f$export$2a703dbb0cb35339)(data);
    if (blob instanceof Promise)
      return this._send_blob(blob);
    if (!chunked && blob.byteLength > this.chunker.chunkedMTU) {
      this._sendChunks(blob);
      return;
    }
    this._bufferedSend(blob);
  }
  async _send_blob(blobPromise) {
    const blob = await blobPromise;
    if (blob.byteLength > this.chunker.chunkedMTU) {
      this._sendChunks(blob);
      return;
    }
    this._bufferedSend(blob);
  }
  _sendChunks(blob) {
    const blobs = this.chunker.chunk(blob);
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} Try to send ${blobs.length} chunks...`);
    for (const blob2 of blobs)
      this.send(blob2, true);
  }
};
var $bbaee3f15f714663$export$6f88fe47d32c9c94 = class extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
  _handleDataMessage({ data }) {
    super.emit("data", data);
  }
  _send(data, _chunked) {
    this._bufferedSend(data);
  }
  constructor(...args) {
    super(...args);
    this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).None;
  }
};
var $817f931e3f9096cf$export$48880ac635f47186 = class extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
  // Handles a DataChannel message.
  _handleDataMessage({ data }) {
    const deserializedData = this.parse(this.decoder.decode(data));
    const peerData = deserializedData["__peerData"];
    if (peerData && peerData.type === "close") {
      this.close();
      return;
    }
    this.emit("data", deserializedData);
  }
  _send(data, _chunked) {
    const encodedData = this.encoder.encode(this.stringify(data));
    if (encodedData.byteLength >= (0, $4f4134156c446392$export$7debb50ef11d5e0b).chunkedMTU) {
      this.emitError((0, $78455e22dea96b8c$export$49ae800c114df41d).MessageToBig, "Message too big for JSON channel");
      return;
    }
    this._bufferedSend(encodedData);
  }
  constructor(...args) {
    super(...args);
    this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).JSON;
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.stringify = JSON.stringify;
    this.parse = JSON.parse;
  }
};
var $416260bce337df90$export$ecd1fc136c422448 = class _$416260bce337df90$export$ecd1fc136c422448 extends (0, $23779d1881157a18$export$6a678e589c8a4542) {
  static #_ = this.DEFAULT_KEY = "peerjs";
  /**
  * The brokering ID of this peer
  *
  * If no ID was specified in {@apilink Peer | the constructor},
  * this will be `undefined` until the {@apilink PeerEvents | `open`} event is emitted.
  */
  get id() {
    return this._id;
  }
  get options() {
    return this._options;
  }
  get open() {
    return this._open;
  }
  /**
  * @internal
  */
  get socket() {
    return this._socket;
  }
  /**
  * A hash of all connections associated with this peer, keyed by the remote peer's ID.
  * @deprecated
  * Return type will change from Object to Map<string,[]>
  */
  get connections() {
    const plainConnections = /* @__PURE__ */ Object.create(null);
    for (const [k, v] of this._connections)
      plainConnections[k] = v;
    return plainConnections;
  }
  /**
  * true if this peer and all of its connections can no longer be used.
  */
  get destroyed() {
    return this._destroyed;
  }
  /**
  * false if there is an active connection to the PeerServer.
  */
  get disconnected() {
    return this._disconnected;
  }
  constructor(id, options) {
    super();
    this._serializers = {
      raw: (0, $bbaee3f15f714663$export$6f88fe47d32c9c94),
      json: (0, $817f931e3f9096cf$export$48880ac635f47186),
      binary: (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108),
      "binary-utf8": (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108),
      default: (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108)
    };
    this._id = null;
    this._lastServerId = null;
    this._destroyed = false;
    this._disconnected = false;
    this._open = false;
    this._connections = /* @__PURE__ */ new Map();
    this._lostMessages = /* @__PURE__ */ new Map();
    let userId;
    if (id && id.constructor == Object)
      options = id;
    else if (id)
      userId = id.toString();
    options = {
      debug: 0,
      host: (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST,
      port: (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_PORT,
      path: "/",
      key: _$416260bce337df90$export$ecd1fc136c422448.DEFAULT_KEY,
      token: (0, $4f4134156c446392$export$7debb50ef11d5e0b).randomToken(),
      config: (0, $4f4134156c446392$export$7debb50ef11d5e0b).defaultConfig,
      referrerPolicy: "strict-origin-when-cross-origin",
      serializers: {},
      ...options
    };
    this._options = options;
    this._serializers = {
      ...this._serializers,
      ...this.options.serializers
    };
    if (this._options.host === "/")
      this._options.host = window.location.hostname;
    if (this._options.path) {
      if (this._options.path[0] !== "/")
        this._options.path = "/" + this._options.path;
      if (this._options.path[this._options.path.length - 1] !== "/")
        this._options.path += "/";
    }
    if (this._options.secure === void 0 && this._options.host !== (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
      this._options.secure = (0, $4f4134156c446392$export$7debb50ef11d5e0b).isSecure();
    else if (this._options.host == (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
      this._options.secure = true;
    if (this._options.logFunction)
      (0, $257947e92926277a$export$2e2bcd8739ae039).setLogFunction(this._options.logFunction);
    (0, $257947e92926277a$export$2e2bcd8739ae039).logLevel = this._options.debug || 0;
    this._api = new (0, $abf266641927cd89$export$2c4e825dc9120f87)(options);
    this._socket = this._createServerConnection();
    if (!(0, $4f4134156c446392$export$7debb50ef11d5e0b).supports.audioVideo && !(0, $4f4134156c446392$export$7debb50ef11d5e0b).supports.data) {
      this._delayedAbort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).BrowserIncompatible, "The current browser does not support WebRTC");
      return;
    }
    if (!!userId && !(0, $4f4134156c446392$export$7debb50ef11d5e0b).validateId(userId)) {
      this._delayedAbort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).InvalidID, `ID "${userId}" is invalid`);
      return;
    }
    if (userId)
      this._initialize(userId);
    else
      this._api.retrieveId().then((id2) => this._initialize(id2)).catch((error) => this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, error));
  }
  _createServerConnection() {
    const socket = new (0, $8f5bfa60836d261d$export$4798917dbf149b79)(this._options.secure, this._options.host, this._options.port, this._options.path, this._options.key, this._options.pingInterval);
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Message, (data) => {
      this._handleMessage(data);
    });
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Error, (error) => {
      this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).SocketError, error);
    });
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Disconnected, () => {
      if (this.disconnected)
        return;
      this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Network, "Lost connection to server.");
      this.disconnect();
    });
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Close, () => {
      if (this.disconnected)
        return;
      this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).SocketClosed, "Underlying socket is already closed.");
    });
    return socket;
  }
  /** Initialize a connection with the server. */
  _initialize(id) {
    this._id = id;
    this.socket.start(id, this._options.token);
  }
  /** Handles messages from the server. */
  _handleMessage(message) {
    const type = message.type;
    const payload = message.payload;
    const peerId = message.src;
    switch (type) {
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Open:
        this._lastServerId = this.id;
        this._open = true;
        this.emit("open", this.id);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Error:
        this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, payload.msg);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).IdTaken:
        this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).UnavailableID, `ID "${this.id}" is taken`);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).InvalidKey:
        this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).InvalidKey, `API KEY "${this._options.key}" is invalid`);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Leave:
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Received leave message from ${peerId}`);
        this._cleanupPeer(peerId);
        this._connections.delete(peerId);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Expire:
        this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).PeerUnavailable, `Could not connect to peer ${peerId}`);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Offer: {
        const connectionId = payload.connectionId;
        let connection = this.getConnection(peerId, connectionId);
        if (connection) {
          connection.close();
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Offer received for existing Connection ID:${connectionId}`);
        }
        if (payload.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media) {
          const mediaConnection = new (0, $5c1d08c7c57da9a3$export$4a84e95a2324ac29)(peerId, this, {
            connectionId,
            _payload: payload,
            metadata: payload.metadata
          });
          connection = mediaConnection;
          this._addConnection(peerId, connection);
          this.emit("call", mediaConnection);
        } else if (payload.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data) {
          const dataConnection = new this._serializers[payload.serialization](peerId, this, {
            connectionId,
            _payload: payload,
            metadata: payload.metadata,
            label: payload.label,
            serialization: payload.serialization,
            reliable: payload.reliable
          });
          connection = dataConnection;
          this._addConnection(peerId, connection);
          this.emit("connection", dataConnection);
        } else {
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Received malformed connection type:${payload.type}`);
          return;
        }
        const messages = this._getMessages(connectionId);
        for (const message2 of messages)
          connection.handleMessage(message2);
        break;
      }
      default: {
        if (!payload) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`You received a malformed message from ${peerId} of type ${type}`);
          return;
        }
        const connectionId = payload.connectionId;
        const connection = this.getConnection(peerId, connectionId);
        if (connection && connection.peerConnection)
          connection.handleMessage(message);
        else if (connectionId)
          this._storeMessage(connectionId, message);
        else
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You received an unrecognized message:", message);
        break;
      }
    }
  }
  /** Stores messages without a set up connection, to be claimed later. */
  _storeMessage(connectionId, message) {
    if (!this._lostMessages.has(connectionId))
      this._lostMessages.set(connectionId, []);
    this._lostMessages.get(connectionId).push(message);
  }
  /**
  * Retrieve messages from lost message store
  * @internal
  */
  //TODO Change it to private
  _getMessages(connectionId) {
    const messages = this._lostMessages.get(connectionId);
    if (messages) {
      this._lostMessages.delete(connectionId);
      return messages;
    }
    return [];
  }
  /**
  * Connects to the remote peer specified by id and returns a data connection.
  * @param peer The brokering ID of the remote peer (their {@apilink Peer.id}).
  * @param options for specifying details about Peer Connection
  */
  connect(peer, options = {}) {
    options = {
      serialization: "default",
      ...options
    };
    if (this.disconnected) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available.");
      this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
      return;
    }
    const dataConnection = new this._serializers[options.serialization](peer, this, options);
    this._addConnection(peer, dataConnection);
    return dataConnection;
  }
  /**
  * Calls the remote peer specified by id and returns a media connection.
  * @param peer The brokering ID of the remote peer (their peer.id).
  * @param stream The caller's media stream
  * @param options Metadata associated with the connection, passed in by whoever initiated the connection.
  */
  call(peer, stream, options = {}) {
    if (this.disconnected) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect.");
      this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
      return;
    }
    if (!stream) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
      return;
    }
    const mediaConnection = new (0, $5c1d08c7c57da9a3$export$4a84e95a2324ac29)(peer, this, {
      ...options,
      _stream: stream
    });
    this._addConnection(peer, mediaConnection);
    return mediaConnection;
  }
  /** Add a data/media connection to this peer. */
  _addConnection(peerId, connection) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add connection ${connection.type}:${connection.connectionId} to peerId:${peerId}`);
    if (!this._connections.has(peerId))
      this._connections.set(peerId, []);
    this._connections.get(peerId).push(connection);
  }
  //TODO should be private
  _removeConnection(connection) {
    const connections = this._connections.get(connection.peer);
    if (connections) {
      const index = connections.indexOf(connection);
      if (index !== -1)
        connections.splice(index, 1);
    }
    this._lostMessages.delete(connection.connectionId);
  }
  /** Retrieve a data/media connection for this peer. */
  getConnection(peerId, connectionId) {
    const connections = this._connections.get(peerId);
    if (!connections)
      return null;
    for (const connection of connections) {
      if (connection.connectionId === connectionId)
        return connection;
    }
    return null;
  }
  _delayedAbort(type, message) {
    setTimeout(() => {
      this._abort(type, message);
    }, 0);
  }
  /**
  * Emits an error message and destroys the Peer.
  * The Peer is not destroyed if it's in a disconnected state, in which case
  * it retains its disconnected state and its existing connections.
  */
  _abort(type, message) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).error("Aborting!");
    this.emitError(type, message);
    if (!this._lastServerId)
      this.destroy();
    else
      this.disconnect();
  }
  /**
  * Destroys the Peer: closes all active connections as well as the connection
  * to the server.
  *
  * :::caution
  * This cannot be undone; the respective peer object will no longer be able
  * to create or receive any connections, its ID will be forfeited on the server,
  * and all of its data and media connections will be closed.
  * :::
  */
  destroy() {
    if (this.destroyed)
      return;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Destroy peer with ID:${this.id}`);
    this.disconnect();
    this._cleanup();
    this._destroyed = true;
    this.emit("close");
  }
  /** Disconnects every connection on this peer. */
  _cleanup() {
    for (const peerId of this._connections.keys()) {
      this._cleanupPeer(peerId);
      this._connections.delete(peerId);
    }
    this.socket.removeAllListeners();
  }
  /** Closes all connections to this peer. */
  _cleanupPeer(peerId) {
    const connections = this._connections.get(peerId);
    if (!connections)
      return;
    for (const connection of connections)
      connection.close();
  }
  /**
  * Disconnects the Peer's connection to the PeerServer. Does not close any
  *  active connections.
  * Warning: The peer can no longer create or accept connections after being
  *  disconnected. It also cannot reconnect to the server.
  */
  disconnect() {
    if (this.disconnected)
      return;
    const currentId = this.id;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Disconnect peer with ID:${currentId}`);
    this._disconnected = true;
    this._open = false;
    this.socket.close();
    this._lastServerId = currentId;
    this._id = null;
    this.emit("disconnected", currentId);
  }
  /** Attempts to reconnect with the same ID.
  *
  * Only {@apilink Peer.disconnect | disconnected peers} can be reconnected.
  * Destroyed peers cannot be reconnected.
  * If the connection fails (as an example, if the peer's old ID is now taken),
  * the peer's existing connections will not close, but any associated errors events will fire.
  */
  reconnect() {
    if (this.disconnected && !this.destroyed) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Attempting reconnection to server with ID ${this._lastServerId}`);
      this._disconnected = false;
      this._initialize(this._lastServerId);
    } else if (this.destroyed)
      throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");
    else if (!this.disconnected && !this.open)
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("In a hurry? We're still trying to make the initial connection!");
    else
      throw new Error(`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`);
  }
  /**
  * Get a list of available peer IDs. If you're running your own server, you'll
  * want to set allow_discovery: true in the PeerServer options. If you're using
  * the cloud server, email team@peerjs.com to get the functionality enabled for
  * your key.
  */
  listAllPeers(cb = (_) => {
  }) {
    this._api.listAllPeers().then((peers) => cb(peers)).catch((error) => this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, error));
  }
};
var $dd0187d7f28e386f$export$2e2bcd8739ae039 = (0, $416260bce337df90$export$ecd1fc136c422448);

// src/peerNet.ts
function newPeerNet(params) {
  const handleMessageFunc = params?.handleMessageFunc || void 0;
  const localURL = process.env.OperatorUrlLocal;
  const liveURL = process.env.OperatorUrlLive;
  const operatorURL = params?.url || (document.URL.indexOf("localhost") > -1 ? localURL : liveURL);
  if (!operatorURL || operatorURL.length < 1) {
    log(logLevels.error, `Unable to get an operatorURL, please check your env file values for OperatorUrlLocal/OperatorUrlLive or provide a URL manually`, ["newPeerNet"], params);
    return null;
  }
  const PeerNet = PeerNetObj(operatorURL);
  if (handleMessageFunc) {
    PeerNet.SetHandleMessage(handleMessageFunc);
  } else {
    log(logLevels.debug, "PeerNetObj created but handleMessage not set.", ["newPeerNet"]);
  }
  return PeerNet;
}
function PeerNetObj(operatorURL) {
  let _OperatorURL = operatorURL;
  let _DisplayName = "";
  let _ConnId;
  let _IsLeader = false;
  let _OrderNumber;
  let _CurrentLeaderId;
  let _CheckInIntervalHandle;
  let _ExpireConnectionsIntervalHandle = setInterval(expireConnections, 1e3);
  let _RoomName;
  let _PeerConnectionString = null;
  let _Peer = setupPeer();
  let _Status = { Phase: 0, Text: "Disconnected" };
  let _assumingLeadership = false;
  let _lastOperatorCheckin = 0;
  const _operatorThrottle = {
    lastMsgToOperatorDT: 0,
    msgsToSendToOperator: [],
    // How many MS should we group messages together before sending 
    timeLimit: 500,
    delaySendHandle: {},
    shouldSend: () => {
      return _operatorThrottle.timeLeft() > 0;
    },
    timeLeft: () => {
      let diff = Date.now() - _operatorThrottle.lastMsgToOperatorDT + _operatorThrottle.timeLimit;
      if (diff < 0) {
        diff = 0;
      }
      return diff;
    },
    send: () => {
      SendToOperator({ Type: "BulkMsg", Msgs: [..._operatorThrottle.msgsToSendToOperator] });
      console.log("Sending bulk to operator", [..._operatorThrottle.msgsToSendToOperator]);
      _operatorThrottle.msgsToSendToOperator = [];
      _operatorThrottle.lastMsgToOperatorDT = Date.now();
    },
    enqueue: (msgObj) => {
      console.log("Adding msg to sendQueue", msgObj);
      _operatorThrottle.msgsToSendToOperator.push(msgObj);
    }
  };
  const newPeerNet2 = {};
  function expireConnections() {
    const badStates = ["closed", "disconnected", "failed"];
    for (const [connId, conn] of GetActivePeers()) {
      const dataConn = conn.PeerConnection;
      if (!dataConn || !dataConn.open || badStates.includes(dataConn.peerConnection.iceConnectionState) || badStates.includes(dataConn.peerConnection.connectionState)) {
        console.log(conn.DisplayName, " is not in a good state. Killing", connId, dataConn.open, dataConn.peerConnection.iceConnectionState, dataConn.peerConnection.connectionState);
        conn.PeerConnection?.close();
        conn.Active = false;
      }
    }
  }
  function GetDisplayName() {
    return _DisplayName;
  }
  newPeerNet2.GetDisplayName = GetDisplayName;
  function setupPeer() {
    let newPeer = new $dd0187d7f28e386f$export$2e2bcd8739ae039();
    newPeer.on("open", function(peerConnectionString) {
      setPeerConnectionString(peerConnectionString);
      setStatus(1, "PeerConnectionString Set");
    });
    newPeer.on("connection", handleIncomingPeerCon);
    return newPeer;
  }
  function setStatus(phase, text) {
    _Status = { Phase: phase, Text: text };
    doHandler("OnStatusChange", { Status: _Status });
  }
  function setPeerConnectionString(peerConnectionString) {
    _PeerConnectionString = peerConnectionString;
    doHandler("OnPeerConnectionStringSet", _PeerConnectionString);
  }
  function handleIncomingPeerCon(dataConn) {
    console.info("You've been connected to by", dataConn.peer);
    handleNewPeerConnection(dataConn, "Incoming");
  }
  function handleOutgoingPeerCon(dataConn) {
    console.info("You've created a connection with", dataConn.peer);
    handleNewPeerConnection(dataConn, "Outgoing");
  }
  function getConnByPeerConnString(connString) {
    for (const [connId, conn] of _Connections) {
      if (conn.PeerConnectionString == connString) {
        return conn;
      }
    }
    return null;
  }
  function handleNewPeerConnection(peerConn, conDir) {
    let conn = getConnByPeerConnString(peerConn.peer);
    if (conn && !conn.Active) {
      if (conn.PeerConnection) {
        conn.PeerConnection.close();
      }
      conn.PeerConnection = peerConn;
      conn.Active = true;
    } else {
      conn = NewConnectionObj(peerConn.peer, null, null, peerConn.peer, null, peerConn, true, null, "Awaiting-Introduction");
    }
    setConnection(conn.ConnId, conn);
    if (conn.Status == "Introduced" && _IsLeader) {
      SendConnectionListUpdate();
    }
    if (conn == null || conn.PeerConnection == null) {
      console.warn(`conn or conn.PeerConnection is null. Exiting handleNewPeerConnection`, conn);
      return;
    }
    SendIntroduction(conn);
    conn.PeerConnection.on("data", function(data) {
      const senderConn = getConnByPeerConnString(conn.PeerConnectionString) || conn;
      _HandleMsg(data, senderConn);
      conn.LastMsgDT = Date.now();
    });
    conn.PeerConnection.on("close", function() {
      console.log("Oh snap... a connection was closed!");
      deleteConnection(conn.ConnId);
    });
    doHandler("OnConnect", { Conn: conn });
  }
  function SendIntroduction(conn) {
    Send(conn, { Type: "Introduction", Data: genMyConnection() });
  }
  function genMyConnection() {
    return NewConnectionObj(_ConnId, _IsLeader, _DisplayName, _PeerConnectionString, Date.now(), null, true, _RoomName, "Introduced", _OrderNumber);
  }
  let _Connections = /* @__PURE__ */ new Map();
  function NewConnectionObj(connId, isLeader, displayName, peerConnectionString, lastMsgDT, peerConnection, active, room, status = "Unknown", orderNumber = void 0) {
    return {
      ConnId: connId,
      IsLeader: isLeader,
      DisplayName: displayName,
      PeerConnectionString: peerConnectionString,
      LastMsgDT: lastMsgDT,
      PeerConnection: peerConnection,
      Active: active,
      Room: room,
      Status: status,
      OrderNumber: orderNumber
    };
  }
  let _Handlers = {
    OnMsg: [],
    OnConnect: [],
    OnDisconnect: [],
    OnConnectionUpdate: [],
    OnCheckIn: [],
    OnStatusChange: [],
    OnPeerConnectionStringSet: [],
    OnLeaderChange: [],
    OnMyLeaderStatusChange: []
  };
  function SetHandler(handlerName, functionToCall, args, durable = false) {
    const handler = { func: functionToCall, args, durable };
    if (_Handlers[handlerName]) {
      _Handlers[handlerName].push(handler);
    }
  }
  newPeerNet2.SetHandler = SetHandler;
  const debugHandlerMessages = false;
  function doHandler(handlerName, ...args) {
    if (typeof args == "undefined") {
      args = [];
    }
    for (const waitingCall of _Handlers[handlerName]) {
      if (typeof waitingCall.args == "undefined") {
        waitingCall.args = [];
      }
      if (debugHandlerMessages)
        console.log("Calling ", handlerName, " with... ", waitingCall.args, args);
      waitingCall.func(...waitingCall.args, ...args);
    }
    _Handlers[handlerName] = _Handlers[handlerName].filter((waitingCall) => {
      return waitingCall.durable;
    });
    if (debugHandlerMessages)
      console.log("Remaining handlers for ", handlerName, _Handlers[handlerName]);
  }
  function Connect(roomName, playerName) {
    if (!_PeerConnectionString) {
      SetHandler("OnPeerConnectionStringSet", this.Connect, [roomName, playerName]);
      return;
    }
    ResetName(playerName);
    _RoomName = roomName;
    setStatus(2, "RoomName Set");
    SendToOperator({ Type: "Check-in", PeerConnectionString: _PeerConnectionString });
  }
  newPeerNet2.Connect = Connect;
  function Disconnect(roomName) {
    throw new Error("Disconnect doesn't do anything yet...");
  }
  newPeerNet2.Disconnect = Disconnect;
  function Send(targetConn, msg) {
    try {
      if (typeof targetConn.PeerConnection == void 0 || !targetConn.Active) {
        ConnectToPeer(targetConn);
      } else {
        targetConn.PeerConnection;
        targetConn.PeerConnection?.send(msg);
      }
    } catch (e) {
      console.warn("Failed to send message...\n");
      console.warn(e);
    }
  }
  newPeerNet2.Send = Send;
  function ResetName(newName) {
    _DisplayName = newName;
  }
  newPeerNet2.ResetName = ResetName;
  function SetOperatorURL(url) {
    _OperatorURL = url;
  }
  newPeerNet2.SetOperatorURL = SetOperatorURL;
  function GetPeers() {
    return _Connections;
  }
  newPeerNet2.GetPeers = GetPeers;
  function GetActivePeers() {
    if (!_Connections || typeof _Connections == "undefined") {
      console.warn("_Connections are not set yet. Chill");
      return /* @__PURE__ */ new Map();
    }
    let retMap = /* @__PURE__ */ new Map();
    _Connections.forEach((conn, connId) => {
      if (conn.Active) {
        retMap.set(connId, conn);
      }
    });
    return retMap;
  }
  newPeerNet2.GetActivePeers = GetActivePeers;
  function isValidMsg(msg) {
    return typeof msg === "object" && msg !== null && "Type" in msg;
  }
  function _HandleMsg(msg, senderConn) {
    if (!isValidMsg(msg)) {
      console.error(`Malformed msg:`, msg);
      return;
    }
    if (msg.Type == "Introduction") {
      UpdateConnectionInfo(msg.Data, senderConn);
      if (_IsLeader) {
        SendConnectionListUpdate();
      }
    } else if (msg.Type == "Req-Introduction") {
      SendIntroduction(senderConn);
    } else if (msg.Type == "Text") {
    } else if (msg.Type == "PeerCheckin") {
    } else if (msg.Type == "LeaderCheckin" && senderConn.IsLeader) {
    } else if (msg.Type == "UpdatedConnList") {
      if (senderConn.IsLeader) {
        handleConnListUpdate(msg.Data.ConnList);
      } else {
        console.warn(`The sender of this update (${senderConn.DisplayName}) does not have the authority to update you conns.`);
      }
    } else if (msg.Type == "RequestLeadership") {
      const nextConn = getTopConnByOrder("Lowest");
      if (typeof nextConn == "undefined" || senderConn.ConnId == nextConn.ConnId) {
        approveLeadersip(senderConn);
      } else {
        console.warn("Uhh -- someone 'not next' tried to become the leader...", senderConn);
      }
    } else if (msg.Type == "ApproveLeadership") {
      if (_assumingLeadership) {
        assumeLeadership();
      }
    } else {
      console.warn(`Unhandled Msg type:`, msg, senderConn);
    }
    const internalMessageTypes = ["LeaderCheckin", "PeerCheckin", "UpdatedConnList", "ApproveLeadership", "RequestLeadership", "LeaderCheckin", "PeerCheckin", "Req-Introduction", "Introduction"];
    if (!internalMessageTypes.includes(msg.Type)) {
      DoHandleMessageFunc(senderConn, msg);
    }
    doHandler("OnMsg", { Sender: senderConn, Message: msg });
  }
  function approveLeadersip(senderConn) {
    setConnection(senderConn.ConnId, { ...senderConn, IsLeader: true });
    console.info(senderConn.DisplayName, " is now the leader");
    Send(senderConn, { Type: "ApproveLeadership" });
    _assumingLeadership = false;
    doHandler("OnLeaderChange", { NewLeader: senderConn });
  }
  function assumeLeadership() {
    setRoomLeader(_ConnId);
    SendConnectionListUpdate();
  }
  function handleConnListUpdate(connList) {
    const connIdList = [];
    for (const connection of connList) {
      if (connection.ConnId == _ConnId) {
        setMyOrderNumber(connection.OrderNumber);
        continue;
      }
      const currentConn = _Connections.has(connection.ConnId) ? _Connections.get(connection.ConnId) : null;
      if (!currentConn) {
        const newConn = NewConnectionObj(connection.ConnId, connection.IsLeader, connection.DisplayName, connection.PeerConnectionString, connection.LastMsgDT, null, false, connection.Room, "Disconnected", connection.OrderNumber);
        setConnection(connection.ConnId, newConn);
      } else {
        if (currentConn.OrderNumber != connection.OrderNumber) {
          const updatedConn = { ...currentConn, OrderNumber: connection.OrderNumber };
          setConnection(connection.ConnId, updatedConn);
        }
      }
      connIdList.push(connection.ConnId);
    }
    for (const [connId, conn] of _Connections) {
      if (!connIdList.includes(connId) && !conn.Active) {
        deleteConnection(connId);
      }
    }
  }
  function SendConnectionListUpdate() {
    setOrderNumbers();
    const connsList = genActivePeersList().filter((conn) => {
      return conn.Room == _RoomName;
    });
    connsList.push(genMyConnection());
    sendToClients({ Type: "UpdatedConnList", Data: { ConnList: connsList } }, true);
    SendToOperator({ Type: "UpdatedConnList", ConnList: connsList });
  }
  function setMyOrderNumber(num) {
    if (typeof num == "undefined") {
      console.warn("Yeah, Lets not un-set your OrderNumber", new Error());
      return;
    }
    _OrderNumber = num;
  }
  function setOrderNumbers() {
    if (_IsLeader) {
      setMyOrderNumber(0);
    }
    for (const [connId, conn] of _Connections) {
      if ((typeof conn.OrderNumber == "undefined" || !conn.OrderNumber) && _IsLeader) {
        const highestOrderNumberConn = getTopConnByOrder("Highest");
        let highestNumber = 0;
        if (typeof highestOrderNumberConn != "undefined") {
          highestNumber = highestOrderNumberConn.OrderNumber || 1;
        }
        conn.OrderNumber = highestNumber + 1;
        setConnection(connId, conn);
      }
    }
  }
  function genActivePeersList() {
    const activePeers = GetActivePeers();
    const peersList = [...activePeers.values()].map((conn) => {
      return { ...conn, PeerConnection: null };
    });
    return peersList;
  }
  let DoHandleMessageFunc = function(senderConn, msg) {
    console.warn("Handle Message function is not set");
  };
  function SetHandleMessage(func) {
    DoHandleMessageFunc = func;
  }
  newPeerNet2.SetHandleMessage = SetHandleMessage;
  function UpdateConnectionInfo(infoObj, senderConn) {
    if (_Connections.has(senderConn.ConnId)) {
      deleteConnection(senderConn.ConnId);
    }
    setConnection(infoObj.ConnId, NewConnectionObj(infoObj.ConnId, infoObj.IsLeader, infoObj.DisplayName, infoObj.PeerConnectionString, Date.now(), senderConn.PeerConnection, true, infoObj.Room, "Introduced", infoObj.OrderNumber));
  }
  function setConnection(connId, conn) {
    _Connections.set(connId, conn);
    doHandler("OnConnectionUpdate", { ConnId: connId, Conn: conn, Source: "setConnection" });
  }
  function getTopConnByOrder(order) {
    let topNumber = 0;
    if (order == "Lowest") {
      topNumber = Number.MAX_SAFE_INTEGER;
    }
    let retConn;
    for (const [connId, conn] of _Connections) {
      if (typeof conn.OrderNumber !== "undefined" && (order == "Highest" && conn.OrderNumber > topNumber || order == "Lowest" && conn.OrderNumber < topNumber)) {
        topNumber = conn.OrderNumber;
        retConn = conn;
      }
    }
    if (typeof retConn == "undefined") {
      return void 0;
    }
    return retConn;
  }
  function deleteConnection(connId) {
    _Connections.delete(connId);
    if (_IsLeader) {
      SendConnectionListUpdate();
    }
    doHandler("OnConnectionUpdate", { ConnId: connId, Source: "deleteConnection" });
  }
  async function SendToOperator(msgObj) {
    if (!_operatorThrottle.shouldSend()) {
      _operatorThrottle.enqueue(msgObj);
      _operatorThrottle.delaySendHandle = setTimeout(_operatorThrottle.send, _operatorThrottle.timeLeft());
      return;
    }
    _operatorThrottle.lastMsgToOperatorDT = Date.now();
    let resultObj;
    try {
      const objToSend = { DisplayName: _DisplayName, ConnId: _ConnId, Room: _RoomName, ...msgObj };
      const response = await fetch(_OperatorURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(objToSend)
      });
      resultObj = await response.json();
      HandleMsgFromOperator(resultObj);
    } catch (error) {
      console.error(error);
    }
  }
  function CloseActiveConnections() {
    for (const [conId, connection] of _Connections) {
      if (connection.Active) {
        connection.PeerConnection?.close();
      }
    }
    doHandler("OnConnectionUpdate", { Source: "CloseActiveConnections" });
  }
  function SetConnections(connectionsList) {
    CloseActiveConnections();
    _Connections = /* @__PURE__ */ new Map();
    for (const connection of connectionsList) {
      if (connection.ConnId == _ConnId) {
        setMyOrderNumber(connection.IsLeader ? 0 : connection.OrderNumber);
        continue;
      }
      let newConn = NewConnectionObj(connection.ConnId, connection.IsLeader, connection.DisplayName, connection.PeerConnectionString, null, null, false, _RoomName, void 0, connection.OrderNumber);
      setConnection(connection.ConnId, newConn);
    }
  }
  function ConnectToPeer(conn) {
    const PeerConnectionString = conn.PeerConnectionString;
    if (!PeerConnectionString) {
      console.warn("PeerConnectionString null. Abandoning connect attempt.", PeerConnectionString);
      return;
    }
    if (_Connections.has(PeerConnectionString)) {
      console.warn("Connection already exists", conn);
      const targetConn = _Connections.get(PeerConnectionString);
      if (typeof targetConn?.PeerConnection == void 0) {
        console.warn("Peer connection is not currently active -- attempting to connect.");
      } else {
        return;
      }
    }
    let newConn = _Peer.connect(PeerConnectionString);
    newConn.on("open", function() {
      handleOutgoingPeerCon(newConn);
    });
    _Peer.on("error", function(err) {
      if (err.type == "peer-unavailable") {
        if (!_Connections.get(conn.ConnId)?.Active) {
          console.warn(`Peer ${conn.DisplayName} is unavailable @ ${PeerConnectionString}`);
          HandleFailedToConnect(conn);
        }
      } else {
        console.error("!!-PEER ERROR-!!", err);
      }
    });
    return conn;
  }
  function HandleMsgFromOperator(resultObj) {
    const expectedInternalMsgTypesToIgnore = ["UpdatedConnList-Response", "UpdatedConnList-Response", "LeaderKeepAlive-Response"];
    if (resultObj.Type == "checkIn-Response") {
      setStatus(3, "Got Operator CheckIn-Response");
      _ConnId = resultObj.ConnId;
      SetConnections(resultObj.CurrentCons);
      setRoomLeader(resultObj.CurrentCons.find((conn) => conn.IsLeader)?.ConnId || "");
      const checkInInterval = resultObj.CheckInInterval;
      if (resultObj.IsLeader) {
        setOrderNumbers();
        greetClients();
      } else {
        greetLeader();
      }
      clearInterval(_CheckInIntervalHandle);
      _CheckInIntervalHandle = setInterval(checkIn, checkInInterval);
      doHandler("OnCheckIn", { CheckInResponse: resultObj });
    } else if (expectedInternalMsgTypesToIgnore.includes(resultObj.Type)) {
      if (resultObj.Error) {
        if (resultObj.Error == "Who the heck are you?") {
          if (_ConnId != resultObj.LeaderIs?.ConnId) {
            if (resultObj && resultObj.LeaderIs) {
              setRoomLeader(resultObj.LeaderIs.ConnId);
            }
          }
        }
        console.error("Error from Operator:", resultObj);
      }
    } else {
      console.warn("Unhandled Response from Operator: ", resultObj);
    }
  }
  function checkIn() {
    if (_IsLeader) {
      checkInWithClients();
      checkInWithOperator();
    } else {
      checkInWithLeader();
    }
  }
  function checkInWithClients() {
    sendToClients({ Type: "LeaderCheckin" });
  }
  function checkInWithOperator() {
    if (Date.now() > _lastOperatorCheckin + 60 * 1e3) {
      SendToOperator({ Type: "LeaderKeepAlive" });
      _lastOperatorCheckin = Date.now();
    }
  }
  function sendToClients(msgObj, activeOnly = false) {
    for (const [connId, conn] of _Connections) {
      if (!activeOnly || conn.Active) {
        Send(conn, msgObj);
      }
    }
  }
  function checkInWithLeader() {
    const leaderConn = getLeaderConn();
    if (!leaderConn) {
      return;
    }
    Send(leaderConn, { Type: "PeerCheckin" });
  }
  function greetLeader() {
    const leaderConn = getLeaderConn();
    if (!leaderConn) {
      return;
    }
    ConnectToPeer(leaderConn);
  }
  function greetClients() {
    for (const [connId, conn] of _Connections) {
      ConnectToPeer(conn);
    }
  }
  function getLeaderConn() {
    for (const [connId, conn] of _Connections) {
      if (conn.IsLeader) {
        return conn;
      }
    }
    console.warn("No leader conn found...");
    HandleMissingLeader();
    return;
  }
  function HandleMissingLeader() {
    const nextLeaderConn = getTopConnByOrder("Lowest");
    if (typeof nextLeaderConn == "undefined") {
      console.log("No next leader defined. Requesting Leadership");
      requestLeadership();
    } else if (typeof _OrderNumber != "undefined" && (typeof nextLeaderConn.OrderNumber == "undefined" || _OrderNumber < nextLeaderConn.OrderNumber)) {
      console.log("Unknown order of leaders OR I'm next in line for the throne. - Requesting Leadership");
      requestLeadership();
    } else {
      Send(nextLeaderConn, { Type: "PeerCheckin" });
    }
  }
  function requestLeadership() {
    if ([...GetPeers().values()].length <= 0) {
      assumeLeadership();
      return;
    }
    sendToAll({ Type: "RequestLeadership" });
    _assumingLeadership = true;
  }
  function sendToAll(msgObj) {
    for (const [connId, conn] of GetPeers()) {
      Send(conn, msgObj);
    }
  }
  function setRoomLeader(newLeaderId) {
    if (_ConnId == newLeaderId && !_IsLeader) {
      _IsLeader = true;
      console.info("-- \u2728You are the leader of this room\u2728 --");
      doHandler("OnMyLeaderStatusChange", { IsLeader: _IsLeader });
    }
    if (_CurrentLeaderId != newLeaderId) {
      _CurrentLeaderId = newLeaderId;
      doHandler("OnLeaderChange", { newLeaderId });
    }
  }
  function HandleFailedToConnect(conn) {
    deleteConnection(conn.ConnId);
    if (conn.IsLeader) {
      console.warn(`Connection: ${conn.ConnId} for ${conn.DisplayName} has been removed. Peer failed to connect`);
      HandleMissingLeader();
    }
  }
  newPeerNet2.ForceCheckin = function() {
    SendToOperator({ Type: "Check-in", PeerConnectionString: _PeerConnectionString });
  };
  newPeerNet2._SendMsgToOperator = function(msg) {
    SendToOperator(msg);
  };
  newPeerNet2.GetPeerId = function() {
    return _PeerConnectionString;
  };
  newPeerNet2.IsLeader = function() {
    return _IsLeader === true;
  };
  newPeerNet2.GetOrderNumber = function() {
    return _OrderNumber;
  };
  return newPeerNet2;
}

// src/rndName.ts
var COOLDOWN_DURATION = 5e3;
var wordTypes = {
  adjective: "adjective",
  noun: "noun"
};
var wordCooldowns = [];
var wordBank = {
  [wordTypes.adjective]: {
    manual: [
      "Lunar",
      "Shiniest",
      "Derpy",
      "Ironic",
      "Impulsive",
      "Mischievous",
      "Wandering",
      "Daring",
      "Dangerous",
      "Hipster",
      "Obnoxious",
      "Crabby",
      "Magical",
      "Rotund",
      "Teenage",
      "Veiled",
      "Misty",
      "Loud",
      "Chivalrous",
      "Handsome",
      "Quirky",
      "Disgruntled",
      "Overripe",
      "American",
      "Bouncy",
      "Bedazzled",
      "Gelatinous",
      "Tragic",
      "Historical",
      "Over-eager",
      "Hungry",
      "Stripiest",
      "Versatile",
      "Juggling",
      "Time-traveling",
      "Ignorant",
      "Bodacious",
      "Clever",
      "First-rate",
      "Hunted",
      "Haunted",
      "Sticky",
      "Contemptuous",
      "Camouflaged",
      "Cheeky",
      "Punchy",
      "Peachy",
      "Valiant",
      "Stumpy",
      "Illuminated",
      "Carnivorous",
      "Gentle",
      "Grim",
      "Killer",
      "Double-fisted",
      "Steam-punk",
      "Righteous",
      "Excellent",
      "Looming",
      "Despicable",
      "Sharp-shooting",
      "Dare-devil",
      "Romantic",
      "Maniacal",
      "Narcoleptic",
      "Sugar-coated",
      "Paranoid",
      "Grumpy",
      "Forgetful",
      "Indulgent",
      "Fortuitous",
      "Shady",
      "Lethargic",
      "Cross-eyed",
      "Devilish",
      "Bumbling",
      "Scruffy-Looking"
    ],
    generated: [
      "Ambitious",
      "Benevolent",
      "Courageous",
      "Diligent",
      "Ethereal",
      "Fanciful",
      "Gleaming",
      "Harmonious",
      "Innovative",
      "Jovial",
      "Keen",
      "Lustrous",
      "Majestic",
      "Nimble",
      "Opulent",
      "Perceptive",
      "Quaint",
      "Radiant",
      "Savvy",
      "Tenacious",
      "Unyielding",
      "Vibrant",
      "Witty",
      "Youthful",
      "Zealous",
      "Adventurous",
      "Blissful",
      "Cheerful",
      "Devoted",
      "Eager",
      "Fearless",
      "Gracious",
      "Heroic",
      "Imaginative",
      "Joyful",
      "Knowledgeable",
      "Lively",
      "Mirthful",
      "Noteworthy",
      "Optimistic",
      "Playful",
      "Quick-witted",
      "Resilient",
      "Sincere",
      "Trustworthy",
      "Unique",
      "Valiant",
      "Warm-hearted",
      "Xenial",
      "Zestful"
    ]
  },
  [wordTypes.noun]: {
    manual: [
      "Dessert",
      "Cobra",
      "Paratrooper",
      "Lemur",
      "Orca",
      "Curtains",
      "Monk",
      "Lieutenant",
      "Drill Sergeant",
      "Lumberjack",
      "Oboe",
      "Cyclops",
      "Mutant",
      "Alien",
      "Sugar Glider",
      "Postal Worker",
      "Garlic",
      "Muffin",
      "Wizard",
      "Icicle",
      "Sunbeam",
      "Vegetable",
      "Ogre",
      "Compass",
      "Shovel",
      "Slinky",
      "Nerf-herder",
      "Nerfgun",
      "Corgi",
      "Champion",
      "Sniper",
      "Politician",
      "Waitress",
      "Luggage",
      "Watermelon",
      "Armadillo",
      "Soldier",
      "Concertmaster",
      "Nurse",
      "Cubicle",
      "Gorilla",
      "Vampire",
      "Twinkie",
      "Ninja",
      "Panda",
      "Penguin",
      "Freeloader",
      "Kitten",
      "Loofah",
      "Starfish",
      "Doughnut",
      "Asteroid",
      "Pop Star",
      "Redneck",
      "Goldfish",
      "Doppleganger",
      "Warrior",
      "Banjo",
      "Sleeping Bag",
      "Raisin",
      "Ballerina",
      "Code Monkey",
      "Beached Whale",
      "Matador",
      "Side-kick",
      "Carnival Worker",
      "Shoe Shiner",
      "Swimmer",
      "Hotspur",
      "Cowboy",
      "Gymnast",
      "Blockhead",
      "Slacker"
    ],
    generated: [
      "Phoenix",
      "Dragon",
      "Hawk",
      "Raven",
      "Wolf",
      "Tiger",
      "Lion",
      "Panther",
      "Bear",
      "Falcon",
      "Shark",
      "Eagle",
      "Viper",
      "Scorpion",
      "Cheetah",
      "Jaguar",
      "Buffalo",
      "Rhino",
      "Koala",
      "Chameleon",
      "Puma",
      "Cobra",
      "Lynx",
      "Pelican",
      "Walrus",
      "Turtle",
      "Antelope",
      "Crane",
      "Flamingo",
      "Peacock",
      "Hyena",
      "Giraffe",
      "Moose",
      "Penguin",
      "Wolverine",
      "Leopard",
      "Fox",
      "Hedgehog",
      "Dolphin",
      "Otter",
      "Seal",
      "Parrot",
      "Kangaroo",
      "Elephant",
      "Horse",
      "Crocodile",
      "Alligator",
      "Beaver",
      "Meerkat",
      "Albatross"
    ]
  }
};
function getRandomName(separator = " ") {
  return getRandomWord(wordTypes.adjective) + separator + getRandomWord(wordTypes.noun);
}
function getRandomWord(wordType) {
  const options = getOptions(wordType);
  const chosenWord = randomItem(options);
  setCooldown(chosenWord, wordType);
  log(logLevels.debug, `Random "${wordType}" "${chosenWord}", has been chosen from ${options}`, ["getRandomWord", "rndName"], [wordCooldowns]);
  return chosenWord;
}
function getOptions(wordType) {
  const options = [...wordBank[wordType].manual, ...wordBank[wordType].generated];
  return applyCooldowns(options, wordType);
}
function applyCooldowns(options, wordType) {
  const now = Date.now();
  wordCooldowns.forEach((cooldown, index) => {
    if (cooldown.expiresAt <= now) {
      wordCooldowns.splice(index, 1);
    }
  });
  const filteredOptions = options.filter(
    (option) => !wordCooldowns.some((cooldown) => cooldown.word === option && cooldown.wordType === wordType)
  );
  if (filteredOptions.length === 0) {
    log(
      logLevels.warning,
      `Filtered list is empty for word type "${wordType}". Ignoring cooldowns.`,
      ["applyCooldowns", "cooldowns"],
      { options, wordType }
    );
  }
  return filteredOptions.length > 0 ? filteredOptions : options;
}
function setCooldown(option, wordType) {
  const now = Date.now();
  const cooldown = {
    word: option,
    wordType,
    expiresAt: now + COOLDOWN_DURATION
    // Set expiration time
  };
  wordCooldowns.push(cooldown);
}

// src/canvasBuddy.ts
function adjustForAnchorAndOffset(x, y, width, height, options) {
  const { anchor = "top-left", offsetX = 0, offsetY = 0 } = options;
  let adjustedX = x;
  let adjustedY = y;
  switch (anchor) {
    case "top-right":
      adjustedX -= width;
      break;
    case "bottom-left":
      adjustedY -= height;
      break;
    case "bottom-right":
      adjustedX -= width;
      adjustedY -= height;
      break;
    case "center":
      adjustedX -= width / 2;
      adjustedY -= height / 2;
      break;
  }
  return { x: adjustedX + offsetX, y: adjustedY + offsetY };
}
function calculateBoundingBox(x, y, width, height, options = { returnDetails: true }, isCircle = false) {
  if (!options.returnDetails)
    return;
  const { rotationAngle = 0, rotationOrigin = "center", anchor = "top-left" } = options;
  const radians = rotationAngle * Math.PI / 180;
  const centerX = rotationOrigin === "center" ? x + width / 2 : x;
  const centerY = rotationOrigin === "center" ? y + height / 2 : y;
  if (isCircle) {
    const radius = width / 2;
    return {
      center: { x: centerX, y: centerY },
      min: { x: centerX - radius, y: centerY - radius },
      max: { x: centerX + radius, y: centerY + radius },
      anchor: adjustForAnchorAndOffset(x, y, width, height, options),
      topLeft: { x: centerX - radius, y: centerY - radius },
      topRight: { x: centerX + radius, y: centerY - radius },
      bottomLeft: { x: centerX - radius, y: centerY + radius },
      bottomRight: { x: centerX + radius, y: centerY + radius },
      topCenter: { x: centerX, y: centerY - radius },
      bottomCenter: { x: centerX, y: centerY + radius },
      leftCenter: { x: centerX - radius, y: centerY },
      rightCenter: { x: centerX + radius, y: centerY },
      dimensions: { width: radius * 2, height: radius * 2 }
    };
  }
  const corners = [
    { x, y },
    { x: x + width, y },
    { x, y: y + height },
    { x: x + width, y: y + height }
  ];
  const rotatedCorners = corners.map((corner) => {
    const dx = corner.x - centerX;
    const dy = corner.y - centerY;
    return {
      x: centerX + dx * Math.cos(radians) - dy * Math.sin(radians),
      y: centerY + dx * Math.sin(radians) + dy * Math.cos(radians)
    };
  });
  const xs = rotatedCorners.map((corner) => corner.x);
  const ys = rotatedCorners.map((corner) => corner.y);
  return {
    center: { x: centerX, y: centerY },
    min: { x: Math.min(...xs), y: Math.min(...ys) },
    max: { x: Math.max(...xs), y: Math.max(...ys) },
    anchor: adjustForAnchorAndOffset(x, y, width, height, options),
    topLeft: rotatedCorners[0],
    topRight: rotatedCorners[1],
    bottomLeft: rotatedCorners[2],
    bottomRight: rotatedCorners[3],
    topCenter: {
      x: (rotatedCorners[0].x + rotatedCorners[1].x) / 2,
      y: rotatedCorners[0].y
    },
    bottomCenter: {
      x: (rotatedCorners[2].x + rotatedCorners[3].x) / 2,
      y: rotatedCorners[2].y
    },
    leftCenter: {
      x: rotatedCorners[0].x,
      y: (rotatedCorners[0].y + rotatedCorners[2].y) / 2
    },
    rightCenter: {
      x: rotatedCorners[1].x,
      y: (rotatedCorners[1].y + rotatedCorners[3].y) / 2
    },
    dimensions: {
      width: Math.abs(Math.max(...xs) - Math.min(...xs)),
      height: Math.abs(Math.max(...ys) - Math.min(...ys))
    }
  };
}
function createCanvasBuddy(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error("Failed to get 2D context");
  const canvasState = createLazyState({ canvasDetails: ["timed", _getCanvasDetails, 1e3] });
  function _calculateBoundingBox(x, y, width, height, options = { returnDetails: true }, isCircle = false) {
    applyOptions(options);
    return calculateBoundingBox(x, y, width, height, options, isCircle);
  }
  function handleRotation(x, y, width, height, options, callback) {
    const { rotationAngle = 0, rotationOrigin = "center" } = options;
    if (rotationAngle === 0) {
      callback();
      return;
    }
    const radians = rotationAngle * Math.PI / 180;
    const centerX = rotationOrigin === "center" ? x + width / 2 : x;
    const centerY = rotationOrigin === "center" ? y + height / 2 : y;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(radians);
    ctx.translate(-centerX, -centerY);
    callback();
    ctx.restore();
  }
  function applyOptions(options = {}) {
    ctx.fillStyle = options.color || "#000";
    ctx.globalAlpha = options.transparency !== void 0 ? Math.max(0, Math.min(1, options.transparency)) : 1;
  }
  function applyTextOptions(options = {}) {
    applyOptions(options);
    ctx.font = `${options.fontSize || 16}px sans-serif`;
    ctx.textAlign = options.textAlign || "start";
  }
  function drawShape(drawFn, x, y, width, height, options, isCircle = false) {
    const { x: adjustedX, y: adjustedY } = adjustForAnchorAndOffset(x, y, width, height, options);
    handleRotation(adjustedX, adjustedY, width, height, options, drawFn);
    if (options.showAnchor) {
      ctx.save();
      ctx.fillStyle = "limegreen";
      ctx.beginPath();
      ctx.arc(adjustedX, adjustedY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return calculateBoundingBox(adjustedX, adjustedY, width, height, options, isCircle);
  }
  function _getCanvasDetails() {
    const { width, height } = canvas;
    const rect = canvas.getBoundingClientRect();
    return {
      width,
      height,
      location: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom
      }
    };
  }
  function markBoundingBoxLocations(boundingBox, excludeKeys = []) {
    const locations = [
      { key: "center", point: boundingBox.center },
      { key: "min", point: boundingBox.min },
      { key: "max", point: boundingBox.max },
      { key: "anchor", point: boundingBox.anchor },
      { key: "topLeft", point: boundingBox.topLeft },
      { key: "topRight", point: boundingBox.topRight },
      { key: "bottomLeft", point: boundingBox.bottomLeft },
      { key: "bottomRight", point: boundingBox.bottomRight },
      { key: "topCenter", point: boundingBox.topCenter },
      { key: "bottomCenter", point: boundingBox.bottomCenter },
      { key: "leftCenter", point: boundingBox.leftCenter },
      { key: "rightCenter", point: boundingBox.rightCenter }
    ];
    const placedLabels = [];
    locations.forEach(({ key, point }) => {
      if (excludeKeys.includes(key)) {
        return;
      }
      const dotSize = 5;
      drawCircle(point.x, point.y, dotSize, {
        color: "red",
        showAnchor: false
      });
      const capKey = key.toUpperCase();
      const textAlign = capKey.includes("LEFT") ? "right" : capKey.includes("RIGHT") ? "left" : "center";
      const verticalAlign = capKey.includes("BOTTOM") ? "bottom" : "top";
      let textOffsetX = textAlign === "right" ? -dotSize : textAlign === "left" ? dotSize : 0;
      let textOffsetY = verticalAlign === "bottom" ? dotSize : -dotSize;
      const fontSize = 12;
      const textWidth = ctx.measureText(key).width;
      const textHeight = fontSize;
      placedLabels.forEach((label) => {
        const distance = Math.sqrt(
          Math.pow(label.x - (point.x + textOffsetX), 2) + Math.pow(label.y - (point.y + textOffsetY), 2)
        );
        if (distance * 2 < Math.max(label.textWidth, textWidth)) {
          const centerPoint = boundingBox.center;
          const dx = point.x - centerPoint.x;
          const dy = point.y - centerPoint.y;
          let isLeft = 0;
          let isBelow = 0;
          if (dx != 0) {
            isLeft = dx > 0 ? 1 : -1;
          }
          if (dy != 0) {
            isBelow = dy > 0 ? 1 : -1;
          }
          const stepSize = fontSize + dotSize / 2;
          textOffsetX += isLeft * stepSize;
          textOffsetY += isBelow * stepSize;
        }
      });
      placedLabels.push({
        x: point.x + textOffsetX,
        y: point.y + textOffsetY,
        textWidth,
        textHeight
      });
      drawText(key, point.x + textOffsetX, point.y + textOffsetY, {
        color: "black",
        fontSize,
        textAlign,
        verticalAlign
      });
    });
  }
  function drawCircle(x, y, radius, options = {}) {
    applyOptions(options);
    return drawShape(() => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }, x, y, radius * 2, radius * 2, options, true);
  }
  function drawSquare(x, y, width, options = {}) {
    applyOptions(options);
    return drawShape(() => ctx.fillRect(x, y, width, width), x, y, width, width, options);
  }
  function drawText(text, x, y, options = {}) {
    const fontSize = options.fontSize || 16;
    const textWidth = ctx.measureText(text).width;
    const height = fontSize;
    applyTextOptions(options);
    return drawShape(() => {
      const verticalOffset = options.verticalAlign === "middle" ? height / 2 : options.verticalAlign === "bottom" ? height : 0;
      ctx.fillText(text, x, y + verticalOffset);
    }, x, y, textWidth, height, options);
  }
  function eraseArea(x, y, width, height) {
    ctx.clearRect(x, y, width, height);
  }
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  function clearBoundingBox(boundingBox) {
    const { min, dimensions } = boundingBox;
    ctx.clearRect(min.x, min.y, dimensions.width, dimensions.height);
  }
  return {
    drawCircle,
    drawSquare,
    drawText,
    markBoundingBoxLocations,
    eraseArea,
    clearCanvas,
    clearBoundingBox,
    calculateBoundingBox,
    width: canvas.width,
    height: canvas.height,
    top: _getCanvasDetails().location.top,
    left: _getCanvasDetails().location.left,
    right: _getCanvasDetails().location.right,
    bottom: _getCanvasDetails().location.bottom
  };
}

// src/customSort.ts
function customSort(collection, sortingDirection, sortProperty, ignoreSymbols = [], caseInsensitive = false) {
  if (!Array.isArray(ignoreSymbols) || !ignoreSymbols.every((sym) => typeof sym === "string")) {
    throw new Error("ignoreSymbols must be an array of strings");
  }
  const ignoreSet = new Set(ignoreSymbols);
  const cleanValue = (value) => {
    if (typeof value !== "string") {
      throw new Error("Value to clean must be a string");
    }
    const result = [];
    let tempNumber = "";
    if (caseInsensitive) {
      value = value.toUpperCase();
    }
    for (let char of value) {
      if (ignoreSet.has(char)) {
        continue;
      }
      if (char >= "0" && char <= "9") {
        tempNumber += char;
      } else {
        if (tempNumber) {
          result.push(parseInt(tempNumber, 10));
          tempNumber = "";
        }
        result.push(char);
      }
    }
    if (tempNumber) {
      result.push(parseInt(tempNumber, 10));
    }
    return result;
  };
  const compareValues = (a, b) => {
    const valueA = typeof a === "number" ? [a] : cleanValue(sortProperty ? String(a[sortProperty]) : String(a));
    const valueB = typeof b === "number" ? [b] : cleanValue(sortProperty ? String(b[sortProperty]) : String(b));
    const maxLength = Math.min(valueA.length, valueB.length);
    for (let i = 0; i < maxLength; i++) {
      const partA = valueA[i];
      const partB = valueB[i];
      if (partA < partB)
        return sortingDirection === "asc" ? -1 : 1;
      if (partA > partB)
        return sortingDirection === "asc" ? 1 : -1;
    }
    if (valueA.length < valueB.length)
      return sortingDirection === "asc" ? -1 : 1;
    if (valueA.length > valueB.length)
      return sortingDirection === "asc" ? 1 : -1;
    return 0;
  };
  return [...collection].sort(compareValues);
}

// src/interpolateLoc.ts
function calculateTangents(vects) {
  let tangents = [];
  for (let i = 0; i < vects.length; i++) {
    if (i === 0) {
      tangents.push({
        x: vects[i + 1].x - vects[i].x,
        y: vects[i + 1].y - vects[i].y
      });
    } else if (i === vects.length - 1) {
      tangents.push({
        x: vects[i - 1].x - vects[i].x,
        y: vects[i - 1].y - vects[i].y
      });
    } else {
      tangents.push({
        x: (vects[i + 1].x - vects[i - 1].x) / 2,
        y: (vects[i + 1].y - vects[i - 1].y) / 2
      });
    }
    tangents[i].x *= vects[i].s;
    tangents[i].y *= vects[i].s;
  }
  return tangents;
}
function hermiteInterpolate(p0, p1, t0, t1, t) {
  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
  const h10 = t ** 3 - 2 * t ** 2 + t;
  const h01 = -2 * t ** 3 + 3 * t ** 2;
  const h11 = t ** 3 - t ** 2;
  return {
    x: h00 * p0.x + h10 * t0.x + h01 * p1.x + h11 * t1.x,
    y: h00 * p0.y + h10 * t0.y + h01 * p1.y + h11 * t1.y
  };
}
function getPositionAtCompletion(vects, completion) {
  if (completion > 100) {
    completion = 99.99;
  }
  const tangents = calculateTangents(vects);
  let t = completion / 100;
  let sectionIndex = 0;
  for (let i = 1; i < vects.length; i++) {
    if (t < vects[i].percentageComplete / 100) {
      sectionIndex = i - 1;
      break;
    }
  }
  const sectionStart = vects[sectionIndex].percentageComplete / 100;
  const sectionEnd = vects[sectionIndex + 1].percentageComplete / 100;
  const localT = (t - sectionStart) / (sectionEnd - sectionStart);
  return hermiteInterpolate(
    vects[sectionIndex],
    vects[sectionIndex + 1],
    tangents[sectionIndex],
    tangents[sectionIndex + 1],
    localT
  );
}

// src/pointMath.ts
function dist(obj1, obj2) {
  return Math.sqrt((obj2.x - obj1.x) * (obj2.x - obj1.x) + (obj2.y - obj1.y) * (obj2.y - obj1.y));
}
function sumOfDistances(points) {
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += dist(points[i], points[i + 1]);
  }
  return totalDistance;
}
function squareOverlap(boxA, boxB) {
  if (!boxA || !boxB || !boxA.max || !boxB.max || !boxA.max.x || !boxB.max.x) {
    return false;
  }
  const overlapX = boxA?.max.x > boxB?.min.x && boxA?.min.x < boxB?.max.x;
  const overlapY = boxA?.max.y > boxB?.min.y && boxA?.min.y < boxB?.max.y;
  return overlapX && overlapY;
}

// src/vector.ts
function getBaseVect(x = 0, y = 0, angle = 0, speed = 0, mass = 0) {
  return { x, y, angle, speed, mass };
}
function vectSum(obj1, obj2) {
  const r1 = obj1.speed * obj1.mass;
  const r2 = obj2.speed * obj2.mass;
  const ar = obj1.angle * Math.PI / 180;
  const br = obj2.angle * Math.PI / 180;
  const r1x = r1 * Math.cos(ar);
  const r1y = r1 * Math.sin(ar);
  const r2x = r2 * Math.cos(br);
  const r2y = r2 * Math.sin(br);
  const rrx = r1x + r2x;
  const rry = r1y + r2y;
  const r = Math.sqrt(rrx * rrx + rry * rry);
  const angr = atan7(rrx, rry);
  return { angle: angr, mag: r, speed: r / obj1.mass };
}
function vectSumAndSet(obj1, obj2) {
  const temp = vectSum(obj1, obj2);
  obj1.angle = temp.angle;
  obj1.speed = temp.mag / obj1.mass;
  return obj1;
}
function atan7(x, y) {
  const xck = Math.abs(x);
  const yck = Math.abs(y);
  const sck = Math.pow(10, -6);
  if (xck < sck) {
    if (yck < sck)
      return 0;
    return y >= 0 ? 90 : 270;
  }
  if (x > 0) {
    if (y >= 0)
      return 180 * Math.atan(y / x) / Math.PI;
    return 180 * Math.atan(y / x) / Math.PI + 360;
  }
  if (x < 0) {
    if (y >= 0)
      return 180 - 180 * Math.atan(-y / x) / Math.PI;
    return -180 + 180 * Math.atan(y / x) / Math.PI + 360;
  }
  return 0;
}
function setupVector() {
  let vectorObj = {
    sum: vectSum,
    sumAndSet: vectSumAndSet,
    getAngle: (obj1, obj2) => atan7(obj2.x - obj1.x, -(obj2.y - obj1.y)),
    getBaseVect,
    keepInBox: (vect, box) => {
      let changed = false;
      if (vect.x < 0) {
        vect.x = 0;
        changed = true;
      }
      if (vect.y < 0) {
        vect.y = 0;
        changed = true;
      }
      if (vect.x + vect.speed > box.x + box.width) {
        vect.x = box.x + box.width - vect.speed;
        changed = true;
      }
      if (vect.y + vect.speed > box.y + box.height) {
        vect.y = box.y + box.height - vect.speed;
        changed = true;
      }
      return changed;
    },
    wrapAngle: (angle) => {
      angle = angle % 360;
      if (angle < 0)
        angle += 360;
      return angle;
    },
    moveObj: (obj) => {
      obj.x += obj.speed * Math.sin(toRadians(obj.angle));
      obj.y += obj.speed * Math.cos(toRadians(obj.angle));
    },
    moveObjBack: (obj) => {
      obj.x -= obj.speed * Math.sin(toRadians(obj.angle));
      obj.y -= obj.speed * Math.cos(toRadians(obj.angle));
    },
    standards: setupVectStandards()
  };
  return vectorObj;
}
function toRadians(angle) {
  return angle * (Math.PI / 180) + Math.PI / 2;
}
function setupVectStandards() {
  return {
    up: getBaseVect(0, 0, 90, 0.5, 1.25),
    down: getBaseVect(0, 0, 270, 0.5, 1.25),
    left: getBaseVect(0, 0, 180, 0.5, 1.25),
    right: getBaseVect(0, 0, 0, 0.5, 1.25),
    breaks: getBaseVect(0, 0, 0, 0.5, 1.25)
  };
}

// src/screenResizer.ts
var screenSizer = {
  screenSize: {
    width: 0,
    height: 0
  },
  resizeGameElementsOnResizeEvent: false,
  resizeGameElementsOnOrientationEvent: false,
  gameOffset: { x: 0, y: 0 },
  gameElements: [],
  center: { x: 0, y: 0 },
  resizeHandler: () => {
  },
  orientationHandler: () => {
  },
  setGameElement(element) {
    this.setGameElements([element.id]);
  },
  setGameElements(listOfIds) {
    const domList = [];
    for (const id of listOfIds) {
      const element = document.getElementById(id);
      if (element) {
        domList.push(element);
      }
    }
    this.gameElements = domList;
  },
  orientationChangeCallback(newScreenSize) {
    console.log("Orientation changed to:", newScreenSize);
  },
  handleOrientation() {
    const newScreenSize = this.getScreenSize();
    if (newScreenSize.width !== this.screenSize.width || newScreenSize.height !== this.screenSize.height) {
      this.screenSize = newScreenSize;
      this.center = this.getCenter();
      this.orientationChangeCallback(newScreenSize);
      if (this.resizeGameElementsOnOrientationEvent || this.resizeGameElementsOnResizeEvent) {
        this.resizeGame();
      }
    }
  },
  /**
   * Get the maximum width and height of the given element or the document by default.
   * @param element - The element to measure. Defaults to `document.body`.
   * @returns The width and height of the element or document.
   */
  getMaxSize(element) {
    const target = element || document.body;
    const inner = document.createElement("p");
    inner.style.width = "100%";
    inner.style.height = "100%";
    inner.style.margin = "0";
    inner.style.padding = "0";
    inner.style.border = "none";
    const outer = document.createElement("div");
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "100%";
    outer.style.height = "100%";
    outer.style.overflow = "hidden";
    outer.style.margin = "0";
    outer.style.padding = "0";
    outer.style.border = "none";
    outer.appendChild(inner);
    target.appendChild(outer);
    const width = inner.offsetWidth;
    const height = inner.offsetHeight;
    target.removeChild(outer);
    return { width, height };
  },
  /**
   * Get the screen size of the document.
   * @returns The width and height of the document body.
   */
  getScreenSize() {
    return this.getMaxSize(document.body);
  },
  biggestSquare() {
    const screenSize = this.getScreenSize();
    const biggestSquare = { ...screenSize };
    if (biggestSquare.width < biggestSquare.height) {
      biggestSquare.height = biggestSquare.width;
    } else if (biggestSquare.width > biggestSquare.height) {
      biggestSquare.width = biggestSquare.height;
    }
    const padX = (screenSize.width - biggestSquare.width) / 2;
    const padY = (screenSize.height - biggestSquare.height) / 2;
    this.resizeGame(biggestSquare);
    this.centerGame(padX, padY);
    this.gameOffset = { x: padX, y: padY };
  },
  resizeGame(screenSize) {
    for (const element of this.gameElements) {
      const maxSize = screenSize ? screenSize : this.getMaxSize(element.parentElement);
      const computedStyle = getComputedStyle(element);
      const borderWidth = {
        top: parseFloat(computedStyle.borderTopWidth || "0"),
        right: parseFloat(computedStyle.borderRightWidth || "0"),
        bottom: parseFloat(computedStyle.borderBottomWidth || "0"),
        left: parseFloat(computedStyle.borderLeftWidth || "0")
      };
      element.width = maxSize.width - (borderWidth.left + borderWidth.right);
      element.height = maxSize.height - (borderWidth.top + borderWidth.bottom);
    }
  },
  centerGame(padX, padY) {
    for (const element of this.gameElements) {
      element.style.left = `${padX}px`;
      element.style.top = `${padY}px`;
    }
  },
  getCenter() {
    return {
      x: this.screenSize.width / 2,
      y: this.screenSize.height / 2
    };
  },
  addEventListeners() {
    this.resizeHandler = this.handleOrientation.bind(this);
    this.orientationHandler = this.handleOrientation.bind(this);
    window.addEventListener("resize", this.resizeHandler, false);
    window.addEventListener("orientationchange", this.orientationHandler, false);
  },
  removeEventListeners() {
    window.removeEventListener("resize", this.resizeHandler, false);
    window.removeEventListener("orientationchange", this.orientationHandler, false);
  }
};

// src/fsm.ts
function memo(predicate) {
  const cache = /* @__PURE__ */ new WeakMap();
  return (ctx, version) => {
    const cached = cache.get(ctx);
    if (cached && cached.version === version) {
      return cached.result;
    }
    const result = predicate(ctx);
    cache.set(ctx, { version, result });
    return result;
  };
}
function and(...predicates) {
  const cache = /* @__PURE__ */ new WeakMap();
  return (ctx, version) => {
    const cached = cache.get(ctx);
    if (cached && cached.version === version) {
      return cached.result;
    }
    for (const pred of predicates) {
      if (!pred(ctx, version)) {
        cache.set(ctx, { version, result: false });
        return false;
      }
    }
    cache.set(ctx, { version, result: true });
    return true;
  };
}
function or(...predicates) {
  const cache = /* @__PURE__ */ new WeakMap();
  return (ctx, version) => {
    const cached = cache.get(ctx);
    if (cached && cached.version === version) {
      return cached.result;
    }
    for (const pred of predicates) {
      if (pred(ctx, version)) {
        cache.set(ctx, { version, result: true });
        return true;
      }
    }
    cache.set(ctx, { version, result: false });
    return false;
  };
}
function not(predicate) {
  const cache = /* @__PURE__ */ new WeakMap();
  return (ctx, version) => {
    const cached = cache.get(ctx);
    if (cached && cached.version === version) {
      return cached.result;
    }
    const result = !predicate(ctx, version);
    cache.set(ctx, { version, result });
    return result;
  };
}
function createFSM(config) {
  return {
    evaluate(ctx, version) {
      const matched = [];
      for (const [name, pred] of Object.entries(config.statuses)) {
        if (pred(ctx, version)) {
          matched.push(name);
        }
      }
      return matched;
    }
  };
}
export {
  Crono,
  PeerNetObj,
  and,
  attachOnClick,
  blockKeywords,
  calculateBoundingBox,
  colorFrmRange,
  createCanvasBuddy,
  createFSM,
  createLazyState,
  createRollingAverage,
  currentLogLevel,
  customSort,
  defineComputedProperties,
  defineComputedProperty,
  dist,
  expose,
  filterKeywords,
  getColorPair,
  getContrastingColor,
  getKeyNameByValue,
  getPositionAtCompletion,
  getRandomName,
  getRndColor,
  getSafeValueById,
  greetLaserMace,
  log,
  logLevels,
  memo,
  newPeerNet,
  not,
  or,
  randomItem,
  removeByIdInPlace,
  rng,
  screenSizer,
  sendRequest,
  setupVector,
  squareOverlap,
  storage,
  sumOfDistances
};

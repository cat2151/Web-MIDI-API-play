angular.module('generatorApp')
.service('Utils', [
function() {
  function getRandomInt(min, max) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
  }

  return {
    getRandomInt: getRandomInt
  };
}]);

angular.module('generatorApp')
.service('GeneratorService', [
function() {
  function generate() {
  }

  return {
    generate: generate
  };
}]);

angular.module('generatorApp')
.service('WebMIDIApiService', [
function() {

  function errorCallback(msg) {
    console.log("[ERROR] ", msg);
  }

  // MIDI Outputデバイスの配列を作成
  function createMidiOutputs(access, outputs) {
    var outputIterator = access.outputs.values();
    for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
        outputs.push(o.value);
    }
    return outputs;
  }

  // MIDI Inputデバイスの配列を作成
  function createMidiInputs(access, inputs) {
    var inputIterator = access.inputs.values();
    for (var i = inputIterator.next(); !i.done; i = inputIterator.next()) {
        inputs.push(i.value);
    }
    return inputs;
  }

  return {
    createMidiInputs: createMidiInputs,
    createMidiOutputs: createMidiOutputs,
    errorCallback: errorCallback
  };
}]);

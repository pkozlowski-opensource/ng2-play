System.register("change_detection/array_changes", ["rtts_assert/rtts_assert", "facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/array_changes";
  var assert,
      isListLikeIterable,
      iterateListLike,
      ListWrapper,
      MapWrapper,
      int,
      isBlank,
      isPresent,
      stringify,
      getMapKey,
      looseIdentical,
      ArrayChanges,
      CollectionChangeRecord,
      _DuplicateItemRecordList,
      _DuplicateMap;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isListLikeIterable = m.isListLikeIterable;
      iterateListLike = m.iterateListLike;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      int = m.int;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      stringify = m.stringify;
      getMapKey = m.getMapKey;
      looseIdentical = m.looseIdentical;
    }],
    execute: function() {
      ArrayChanges = $__export("ArrayChanges", (function() {
        var ArrayChanges = function ArrayChanges() {
          this._collection = null;
          this._length = null;
          this._linkedRecords = null;
          this._unlinkedRecords = null;
          this._previousItHead = null;
          this._itHead = null;
          this._itTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._movesHead = null;
          this._movesTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
        };
        return ($traceurRuntime.createClass)(ArrayChanges, {
          get collection() {
            return this._collection;
          },
          get length() {
            return assert.returnType((this._length), int);
          },
          forEachItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._itHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachMovedItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          check: function(collection) {
            var $__0 = this;
            this._reset();
            var record = assert.type(this._itHead, CollectionChangeRecord);
            var mayBeDirty = assert.type(false, $traceurRuntime.type.boolean);
            var index,
                item;
            if (ListWrapper.isList(collection)) {
              var list = collection;
              this._length = collection.length;
              for (index = 0; index < this._length; index++) {
                item = list[index];
                if (record === null || !looseIdentical(record.item, item)) {
                  record = this._mismatch(record, item, index);
                  mayBeDirty = true;
                } else if (mayBeDirty) {
                  record = this._verifyReinsertion(record, item, index);
                }
                record = record._next;
              }
            } else {
              index = 0;
              iterateListLike(collection, (function(item) {
                if (record === null || !looseIdentical(record.item, item)) {
                  record = $__0._mismatch(record, item, index);
                  mayBeDirty = true;
                } else if (mayBeDirty) {
                  record = $__0._verifyReinsertion(record, item, index);
                }
                record = record._next;
                index++;
              }));
              this._length = index;
            }
            this._truncate(record);
            this._collection = collection;
            return assert.returnType((this.isDirty), $traceurRuntime.type.boolean);
          },
          get isDirty() {
            return assert.returnType((this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null), $traceurRuntime.type.boolean);
          },
          _reset: function() {
            if (this.isDirty) {
              var record;
              var nextRecord;
              for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
              }
              for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                record.previousIndex = record.currentIndex;
              }
              this._additionsHead = this._additionsTail = null;
              for (record = this._movesHead; record !== null; record = nextRecord) {
                record.previousIndex = record.currentIndex;
                nextRecord = record._nextMoved;
              }
              this._movesHead = this._movesTail = null;
              this._removalsHead = this._removalsTail = null;
            }
          },
          _mismatch: function(record, item, index) {
            assert.argumentTypes(record, CollectionChangeRecord, item, $traceurRuntime.type.any, index, int);
            var previousRecord;
            if (record === null) {
              previousRecord = this._itTail;
            } else {
              previousRecord = record._prev;
              this._remove(record);
            }
            record = this._linkedRecords === null ? null : this._linkedRecords.get(item, index);
            if (record !== null) {
              this._moveAfter(record, previousRecord, index);
            } else {
              record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
              if (record !== null) {
                this._reinsertAfter(record, previousRecord, index);
              } else {
                record = this._addAfter(new CollectionChangeRecord(item), previousRecord, index);
              }
            }
            return assert.returnType((record), CollectionChangeRecord);
          },
          _verifyReinsertion: function(record, item, index) {
            assert.argumentTypes(record, CollectionChangeRecord, item, $traceurRuntime.type.any, index, int);
            var reinsertRecord = assert.type(this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item), CollectionChangeRecord);
            if (reinsertRecord !== null) {
              record = this._reinsertAfter(reinsertRecord, record._prev, index);
            } else if (record.currentIndex != index) {
              record.currentIndex = index;
              this._addToMoves(record, index);
            }
            return assert.returnType((record), CollectionChangeRecord);
          },
          _truncate: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            while (record !== null) {
              var nextRecord = assert.type(record._next, CollectionChangeRecord);
              this._addToRemovals(this._unlink(record));
              record = nextRecord;
            }
            if (this._unlinkedRecords !== null) {
              this._unlinkedRecords.clear();
            }
            if (this._additionsTail !== null) {
              this._additionsTail._nextAdded = null;
            }
            if (this._movesTail !== null) {
              this._movesTail._nextMoved = null;
            }
            if (this._itTail !== null) {
              this._itTail._next = null;
            }
            if (this._removalsTail !== null) {
              this._removalsTail._nextRemoved = null;
            }
          },
          _reinsertAfter: function(record, prevRecord, index) {
            assert.argumentTypes(record, CollectionChangeRecord, prevRecord, CollectionChangeRecord, index, int);
            if (this._unlinkedRecords !== null) {
              this._unlinkedRecords.remove(record);
            }
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
              this._removalsHead = next;
            } else {
              prev._nextRemoved = next;
            }
            if (next === null) {
              this._removalsTail = prev;
            } else {
              next._prevRemoved = prev;
            }
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return assert.returnType((record), CollectionChangeRecord);
          },
          _moveAfter: function(record, prevRecord, index) {
            assert.argumentTypes(record, CollectionChangeRecord, prevRecord, CollectionChangeRecord, index, int);
            this._unlink(record);
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return assert.returnType((record), CollectionChangeRecord);
          },
          _addAfter: function(record, prevRecord, index) {
            assert.argumentTypes(record, CollectionChangeRecord, prevRecord, CollectionChangeRecord, index, int);
            this._insertAfter(record, prevRecord, index);
            if (this._additionsTail === null) {
              this._additionsTail = this._additionsHead = record;
            } else {
              this._additionsTail = this._additionsTail._nextAdded = record;
            }
            return assert.returnType((record), CollectionChangeRecord);
          },
          _insertAfter: function(record, prevRecord, index) {
            assert.argumentTypes(record, CollectionChangeRecord, prevRecord, CollectionChangeRecord, index, int);
            var next = assert.type(prevRecord === null ? this._itHead : prevRecord._next, CollectionChangeRecord);
            record._next = next;
            record._prev = prevRecord;
            if (next === null) {
              this._itTail = record;
            } else {
              next._prev = record;
            }
            if (prevRecord === null) {
              this._itHead = record;
            } else {
              prevRecord._next = record;
            }
            if (this._linkedRecords === null) {
              this._linkedRecords = new _DuplicateMap();
            }
            this._linkedRecords.put(record);
            record.currentIndex = index;
            return assert.returnType((record), CollectionChangeRecord);
          },
          _remove: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            return assert.returnType((this._addToRemovals(this._unlink(record))), CollectionChangeRecord);
          },
          _unlink: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            if (this._linkedRecords !== null) {
              this._linkedRecords.remove(record);
            }
            var prev = record._prev;
            var next = record._next;
            if (prev === null) {
              this._itHead = next;
            } else {
              prev._next = next;
            }
            if (next === null) {
              this._itTail = prev;
            } else {
              next._prev = prev;
            }
            return assert.returnType((record), CollectionChangeRecord);
          },
          _addToMoves: function(record, toIndex) {
            assert.argumentTypes(record, CollectionChangeRecord, toIndex, int);
            if (record.previousIndex === toIndex) {
              return assert.returnType((record), CollectionChangeRecord);
            }
            if (this._movesTail === null) {
              this._movesTail = this._movesHead = record;
            } else {
              this._movesTail = this._movesTail._nextMoved = record;
            }
            return assert.returnType((record), CollectionChangeRecord);
          },
          _addToRemovals: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            if (this._unlinkedRecords === null) {
              this._unlinkedRecords = new _DuplicateMap();
            }
            this._unlinkedRecords.put(record);
            record.currentIndex = null;
            record._nextRemoved = null;
            if (this._removalsTail === null) {
              this._removalsTail = this._removalsHead = record;
              record._prevRemoved = null;
            } else {
              record._prevRemoved = this._removalsTail;
              this._removalsTail = this._removalsTail._nextRemoved = record;
            }
            return assert.returnType((record), CollectionChangeRecord);
          },
          toString: function() {
            var record;
            var list = [];
            for (record = this._itHead; record !== null; record = record._next) {
              ListWrapper.push(list, record);
            }
            var previous = [];
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
              ListWrapper.push(previous, record);
            }
            var additions = [];
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              ListWrapper.push(additions, record);
            }
            var moves = [];
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
              ListWrapper.push(moves, record);
            }
            var removals = [];
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              ListWrapper.push(removals, record);
            }
            return assert.returnType(("collection: " + list.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n"), $traceurRuntime.type.string);
          }
        }, {supports: function(obj) {
            return assert.returnType((isListLikeIterable(obj)), $traceurRuntime.type.boolean);
          }});
      }()));
      Object.defineProperty(ArrayChanges.prototype.forEachItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(ArrayChanges.prototype.forEachPreviousItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(ArrayChanges.prototype.forEachAddedItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(ArrayChanges.prototype.forEachMovedItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(ArrayChanges.prototype.forEachRemovedItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(ArrayChanges.prototype._mismatch, "parameters", {get: function() {
          return [[CollectionChangeRecord], [], [int]];
        }});
      Object.defineProperty(ArrayChanges.prototype._verifyReinsertion, "parameters", {get: function() {
          return [[CollectionChangeRecord], [], [int]];
        }});
      Object.defineProperty(ArrayChanges.prototype._truncate, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
      Object.defineProperty(ArrayChanges.prototype._reinsertAfter, "parameters", {get: function() {
          return [[CollectionChangeRecord], [CollectionChangeRecord], [int]];
        }});
      Object.defineProperty(ArrayChanges.prototype._moveAfter, "parameters", {get: function() {
          return [[CollectionChangeRecord], [CollectionChangeRecord], [int]];
        }});
      Object.defineProperty(ArrayChanges.prototype._addAfter, "parameters", {get: function() {
          return [[CollectionChangeRecord], [CollectionChangeRecord], [int]];
        }});
      Object.defineProperty(ArrayChanges.prototype._insertAfter, "parameters", {get: function() {
          return [[CollectionChangeRecord], [CollectionChangeRecord], [int]];
        }});
      Object.defineProperty(ArrayChanges.prototype._remove, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
      Object.defineProperty(ArrayChanges.prototype._unlink, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
      Object.defineProperty(ArrayChanges.prototype._addToMoves, "parameters", {get: function() {
          return [[CollectionChangeRecord], [int]];
        }});
      Object.defineProperty(ArrayChanges.prototype._addToRemovals, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
      CollectionChangeRecord = $__export("CollectionChangeRecord", (function() {
        var CollectionChangeRecord = function CollectionChangeRecord(item) {
          this.currentIndex = null;
          this.previousIndex = null;
          this.item = item;
          this._nextPrevious = null;
          this._prev = null;
          this._next = null;
          this._prevDup = null;
          this._nextDup = null;
          this._prevRemoved = null;
          this._nextRemoved = null;
          this._nextAdded = null;
          this._nextMoved = null;
        };
        return ($traceurRuntime.createClass)(CollectionChangeRecord, {toString: function() {
            return assert.returnType((this.previousIndex === this.currentIndex ? stringify(this.item) : stringify(this.item) + '[' + stringify(this.previousIndex) + '->' + stringify(this.currentIndex) + ']'), $traceurRuntime.type.string);
          }}, {});
      }()));
      _DuplicateItemRecordList = (function() {
        var _DuplicateItemRecordList = function _DuplicateItemRecordList() {
          this._head = null;
          this._tail = null;
        };
        return ($traceurRuntime.createClass)(_DuplicateItemRecordList, {
          add: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            if (this._head === null) {
              this._head = this._tail = record;
              record._nextDup = null;
              record._prevDup = null;
            } else {
              this._tail._nextDup = record;
              record._prevDup = this._tail;
              record._nextDup = null;
              this._tail = record;
            }
          },
          get: function(item, afterIndex) {
            assert.argumentTypes(item, $traceurRuntime.type.any, afterIndex, int);
            var record;
            for (record = this._head; record !== null; record = record._nextDup) {
              if ((afterIndex === null || afterIndex < record.currentIndex) && looseIdentical(record.item, item)) {
                return assert.returnType((record), CollectionChangeRecord);
              }
            }
            return assert.returnType((null), CollectionChangeRecord);
          },
          remove: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            var prev = assert.type(record._prevDup, CollectionChangeRecord);
            var next = assert.type(record._nextDup, CollectionChangeRecord);
            if (prev === null) {
              this._head = next;
            } else {
              prev._nextDup = next;
            }
            if (next === null) {
              this._tail = prev;
            } else {
              next._prevDup = prev;
            }
            return assert.returnType((this._head === null), $traceurRuntime.type.boolean);
          }
        }, {});
      }());
      Object.defineProperty(_DuplicateItemRecordList.prototype.add, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
      Object.defineProperty(_DuplicateItemRecordList.prototype.get, "parameters", {get: function() {
          return [[], [int]];
        }});
      Object.defineProperty(_DuplicateItemRecordList.prototype.remove, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
      _DuplicateMap = (function() {
        var _DuplicateMap = function _DuplicateMap() {
          this.map = MapWrapper.create();
        };
        return ($traceurRuntime.createClass)(_DuplicateMap, {
          put: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            var key = getMapKey(record.item);
            var duplicates = MapWrapper.get(this.map, key);
            if (!isPresent(duplicates)) {
              duplicates = new _DuplicateItemRecordList();
              MapWrapper.set(this.map, key, duplicates);
            }
            duplicates.add(record);
          },
          get: function(value) {
            var afterIndex = arguments[1] !== (void 0) ? arguments[1] : null;
            var key = getMapKey(value);
            var recordList = MapWrapper.get(this.map, key);
            return assert.returnType((isBlank(recordList) ? null : recordList.get(value, afterIndex)), CollectionChangeRecord);
          },
          remove: function(record) {
            assert.argumentTypes(record, CollectionChangeRecord);
            var key = getMapKey(record.item);
            var recordList = assert.type(MapWrapper.get(this.map, key), _DuplicateItemRecordList);
            if (recordList.remove(record)) {
              MapWrapper.delete(this.map, key);
            }
            return assert.returnType((record), CollectionChangeRecord);
          },
          get isEmpty() {
            return assert.returnType((MapWrapper.size(this.map) === 0), $traceurRuntime.type.boolean);
          },
          clear: function() {
            MapWrapper.clear(this.map);
          },
          toString: function() {
            return assert.returnType(('_DuplicateMap(' + stringify(this.map) + ')'), $traceurRuntime.type.string);
          }
        }, {});
      }());
      Object.defineProperty(_DuplicateMap.prototype.put, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
      Object.defineProperty(_DuplicateMap.prototype.remove, "parameters", {get: function() {
          return [[CollectionChangeRecord]];
        }});
    }
  };
});




System.register("change_detection/change_detection", ["./parser/ast", "./parser/lexer", "./parser/parser", "./parser/context_with_variable_bindings", "./exceptions", "./interfaces", "./proto_change_detector", "./dynamic_change_detector"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/change_detection";
  return {
    setters: [function(m) {
      $__export("AST", m.AST);
    }, function(m) {
      $__export("Lexer", m.Lexer);
    }, function(m) {
      $__export("Parser", m.Parser);
    }, function(m) {
      $__export("ContextWithVariableBindings", m.ContextWithVariableBindings);
    }, function(m) {
      $__export("ExpressionChangedAfterItHasBeenChecked", m.ExpressionChangedAfterItHasBeenChecked);
      $__export("ChangeDetectionError", m.ChangeDetectionError);
    }, function(m) {
      $__export("ChangeRecord", m.ChangeRecord);
      $__export("ChangeDispatcher", m.ChangeDispatcher);
      $__export("ChangeDetector", m.ChangeDetector);
    }, function(m) {
      $__export("ProtoChangeDetector", m.ProtoChangeDetector);
    }, function(m) {
      $__export("DynamicChangeDetector", m.DynamicChangeDetector);
    }],
    execute: function() {}
  };
});




System.register("change_detection/dynamic_change_detector", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "./parser/context_with_variable_bindings", "./array_changes", "./keyvalue_changes", "./proto_change_detector", "./interfaces", "./exceptions"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/dynamic_change_detector";
  var assert,
      isPresent,
      isBlank,
      BaseException,
      FunctionWrapper,
      List,
      ListWrapper,
      MapWrapper,
      StringMapWrapper,
      ContextWithVariableBindings,
      ArrayChanges,
      KeyValueChanges,
      ProtoRecord,
      RECORD_TYPE_SELF,
      RECORD_TYPE_PROPERTY,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_CONST,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_INVOKE_PURE_FUNCTION,
      RECORD_TYPE_INVOKE_FORMATTER,
      RECORD_TYPE_STRUCTURAL_CHECK,
      ProtoChangeDetector,
      ChangeDetector,
      ChangeRecord,
      ChangeDispatcher,
      ExpressionChangedAfterItHasBeenChecked,
      ChangeDetectionError,
      _uninitialized,
      SimpleChange,
      DynamicChangeDetector,
      _singleElementList;
  function isSame(a, b) {
    if (a === b)
      return true;
    if (a instanceof String && b instanceof String && a == b)
      return true;
    if ((a !== a) && (b !== b))
      return true;
    return false;
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      BaseException = m.BaseException;
      FunctionWrapper = m.FunctionWrapper;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      ContextWithVariableBindings = m.ContextWithVariableBindings;
    }, function(m) {
      ArrayChanges = m.ArrayChanges;
    }, function(m) {
      KeyValueChanges = m.KeyValueChanges;
    }, function(m) {
      ProtoRecord = m.ProtoRecord;
      RECORD_TYPE_SELF = m.RECORD_TYPE_SELF;
      RECORD_TYPE_PROPERTY = m.RECORD_TYPE_PROPERTY;
      RECORD_TYPE_INVOKE_METHOD = m.RECORD_TYPE_INVOKE_METHOD;
      RECORD_TYPE_CONST = m.RECORD_TYPE_CONST;
      RECORD_TYPE_INVOKE_CLOSURE = m.RECORD_TYPE_INVOKE_CLOSURE;
      RECORD_TYPE_INVOKE_PURE_FUNCTION = m.RECORD_TYPE_INVOKE_PURE_FUNCTION;
      RECORD_TYPE_INVOKE_FORMATTER = m.RECORD_TYPE_INVOKE_FORMATTER;
      RECORD_TYPE_STRUCTURAL_CHECK = m.RECORD_TYPE_STRUCTURAL_CHECK;
      ProtoChangeDetector = m.ProtoChangeDetector;
    }, function(m) {
      ChangeDetector = m.ChangeDetector;
      ChangeRecord = m.ChangeRecord;
      ChangeDispatcher = m.ChangeDispatcher;
    }, function(m) {
      ExpressionChangedAfterItHasBeenChecked = m.ExpressionChangedAfterItHasBeenChecked;
      ChangeDetectionError = m.ChangeDetectionError;
    }],
    execute: function() {
      _uninitialized = new Object();
      SimpleChange = (function() {
        var SimpleChange = function SimpleChange(previousValue, currentValue) {
          assert.argumentTypes(previousValue, $traceurRuntime.type.any, currentValue, $traceurRuntime.type.any);
          this.previousValue = previousValue;
          this.currentValue = currentValue;
        };
        return ($traceurRuntime.createClass)(SimpleChange, {}, {});
      }());
      Object.defineProperty(SimpleChange, "parameters", {get: function() {
          return [[$traceurRuntime.type.any], [$traceurRuntime.type.any]];
        }});
      DynamicChangeDetector = $__export("DynamicChangeDetector", (function($__super) {
        var DynamicChangeDetector = function DynamicChangeDetector(dispatcher, formatters, protoRecords) {
          assert.argumentTypes(dispatcher, $traceurRuntime.type.any, formatters, Map, protoRecords, List);
          this.dispatcher = dispatcher;
          this.formatters = formatters;
          this.values = ListWrapper.createFixedSize(protoRecords.length + 1);
          ListWrapper.fill(this.values, _uninitialized);
          this.protos = protoRecords;
          this.children = [];
        };
        return ($traceurRuntime.createClass)(DynamicChangeDetector, {
          addChild: function(cd) {
            assert.argumentTypes(cd, ChangeDetector);
            ListWrapper.push(this.children, cd);
            cd.parent = this;
          },
          removeChild: function(cd) {
            assert.argumentTypes(cd, ChangeDetector);
            ListWrapper.remove(this.children, cd);
          },
          remove: function() {
            this.parent.removeChild(this);
          },
          setContext: function(context) {
            assert.argumentTypes(context, $traceurRuntime.type.any);
            this.values[0] = context;
          },
          detectChanges: function() {
            this._detectChanges(false);
          },
          checkNoChanges: function() {
            this._detectChanges(true);
          },
          _detectChanges: function(throwOnChange) {
            assert.argumentTypes(throwOnChange, $traceurRuntime.type.boolean);
            this._detectChangesInRecords(throwOnChange);
            this._detectChangesInChildren(throwOnChange);
          },
          _detectChangesInRecords: function(throwOnChange) {
            assert.argumentTypes(throwOnChange, $traceurRuntime.type.boolean);
            var protos = assert.type(this.protos, List);
            var updatedRecords = null;
            var currentGroup = null;
            for (var i = 0; i < protos.length; ++i) {
              var proto = assert.type(protos[i], ProtoRecord);
              var change = this._check(proto);
              if (isPresent(change) && proto.terminal) {
                if (throwOnChange)
                  throw new ExpressionChangedAfterItHasBeenChecked(proto, change);
                currentGroup = proto.groupMemento;
                updatedRecords = this._addRecord(updatedRecords, proto, change);
              }
              if (isPresent(updatedRecords)) {
                var lastRecordOfCurrentGroup = protos.length == i + 1 || currentGroup !== protos[i + 1].groupMemento;
                if (lastRecordOfCurrentGroup) {
                  this.dispatcher.onRecordChange(currentGroup, updatedRecords);
                  updatedRecords = null;
                }
              }
            }
          },
          _check: function(proto) {
            assert.argumentTypes(proto, ProtoRecord);
            try {
              if (proto.mode == RECORD_TYPE_STRUCTURAL_CHECK) {
                return this._structuralCheck(proto);
              } else {
                return this._referenceCheck(proto);
              }
            } catch (e) {
              throw new ChangeDetectionError(proto, e);
            }
          },
          _referenceCheck: function(proto) {
            assert.argumentTypes(proto, ProtoRecord);
            var prevValue = this._readSelf(proto);
            var currValue = this._calculateCurrValue(proto);
            if (!isSame(prevValue, currValue)) {
              this._writeSelf(proto, currValue);
              return new SimpleChange(prevValue === _uninitialized ? null : prevValue, currValue);
            } else {
              return null;
            }
          },
          _calculateCurrValue: function(proto) {
            assert.argumentTypes(proto, ProtoRecord);
            switch (proto.mode) {
              case RECORD_TYPE_SELF:
                throw new BaseException("Cannot evaluate self");
              case RECORD_TYPE_CONST:
                return proto.funcOrValue;
              case RECORD_TYPE_PROPERTY:
                var context = this._readContext(proto);
                while (context instanceof ContextWithVariableBindings) {
                  if (context.hasBinding(proto.name)) {
                    return context.get(proto.name);
                  }
                  context = context.parent;
                }
                var propertyGetter = assert.type(proto.funcOrValue, Function);
                return propertyGetter(context);
              case RECORD_TYPE_INVOKE_METHOD:
                var methodInvoker = assert.type(proto.funcOrValue, Function);
                return methodInvoker(this._readContext(proto), this._readArgs(proto));
              case RECORD_TYPE_INVOKE_CLOSURE:
                return FunctionWrapper.apply(this._readContext(proto), this._readArgs(proto));
              case RECORD_TYPE_INVOKE_PURE_FUNCTION:
                return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto));
              case RECORD_TYPE_INVOKE_FORMATTER:
                var formatter = MapWrapper.get(this.formatters, proto.funcOrValue);
                return FunctionWrapper.apply(formatter, this._readArgs(proto));
              default:
                throw new BaseException(("Unknown operation " + proto.mode));
            }
          },
          _structuralCheck: function(proto) {
            assert.argumentTypes(proto, ProtoRecord);
            var self = this._readSelf(proto);
            var context = this._readContext(proto);
            if (isBlank(self) || self === _uninitialized) {
              if (ArrayChanges.supports(context)) {
                self = new ArrayChanges();
              } else if (KeyValueChanges.supports(context)) {
                self = new KeyValueChanges();
              }
            }
            if (ArrayChanges.supports(context)) {
              if (self.check(context)) {
                this._writeSelf(proto, self);
                return new SimpleChange(null, self);
              }
            } else if (KeyValueChanges.supports(context)) {
              if (self.check(context)) {
                this._writeSelf(proto, self);
                return new SimpleChange(null, self);
              }
            } else if (context == null) {
              this._writeSelf(proto, null);
              return new SimpleChange(null, null);
            } else {
              throw new BaseException(("Unsupported type (" + context + ")"));
            }
          },
          _addRecord: function(updatedRecords, proto, change) {
            assert.argumentTypes(updatedRecords, List, proto, ProtoRecord, change, $traceurRuntime.type.any);
            var record = new ChangeRecord(proto.bindingMemento, change);
            if (isBlank(updatedRecords)) {
              updatedRecords = _singleElementList;
              updatedRecords[0] = record;
            } else if (updatedRecords === _singleElementList) {
              updatedRecords = [_singleElementList[0], record];
            } else {
              ListWrapper.push(updatedRecords, record);
            }
            return assert.returnType((updatedRecords), List);
          },
          _detectChangesInChildren: function(throwOnChange) {
            assert.argumentTypes(throwOnChange, $traceurRuntime.type.boolean);
            var children = this.children;
            for (var i = 0; i < children.length; ++i) {
              children[i]._detectChanges(throwOnChange);
            }
          },
          _readContext: function(proto) {
            assert.argumentTypes(proto, ProtoRecord);
            return this.values[proto.contextIndex];
          },
          _readSelf: function(proto) {
            assert.argumentTypes(proto, ProtoRecord);
            return this.values[proto.record_type_selfIndex];
          },
          _writeSelf: function(proto, value) {
            assert.argumentTypes(proto, ProtoRecord, value, $traceurRuntime.type.any);
            this.values[proto.record_type_selfIndex] = value;
          },
          _readArgs: function(proto) {
            assert.argumentTypes(proto, ProtoRecord);
            var res = ListWrapper.createFixedSize(proto.args.length);
            var args = proto.args;
            for (var i = 0; i < args.length; ++i) {
              res[i] = this.values[args[i]];
            }
            return res;
          }
        }, {}, $__super);
      }(ChangeDetector)));
      Object.defineProperty(DynamicChangeDetector, "parameters", {get: function() {
          return [[$traceurRuntime.type.any], [Map], [List]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype.addChild, "parameters", {get: function() {
          return [[ChangeDetector]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype.removeChild, "parameters", {get: function() {
          return [[ChangeDetector]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype.setContext, "parameters", {get: function() {
          return [[$traceurRuntime.type.any]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._detectChanges, "parameters", {get: function() {
          return [[$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._detectChangesInRecords, "parameters", {get: function() {
          return [[$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._check, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._referenceCheck, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._calculateCurrValue, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._structuralCheck, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._addRecord, "parameters", {get: function() {
          return [[List], [ProtoRecord], []];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._detectChangesInChildren, "parameters", {get: function() {
          return [[$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._readContext, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._readSelf, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._writeSelf, "parameters", {get: function() {
          return [[ProtoRecord], []];
        }});
      Object.defineProperty(DynamicChangeDetector.prototype._readArgs, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      _singleElementList = [null];
    }
  };
});




System.register("change_detection/exceptions", ["rtts_assert/rtts_assert", "./proto_change_detector"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/exceptions";
  var assert,
      ProtoRecord,
      ExpressionChangedAfterItHasBeenChecked,
      ChangeDetectionError;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      ProtoRecord = m.ProtoRecord;
    }],
    execute: function() {
      ExpressionChangedAfterItHasBeenChecked = $__export("ExpressionChangedAfterItHasBeenChecked", (function($__super) {
        var ExpressionChangedAfterItHasBeenChecked = function ExpressionChangedAfterItHasBeenChecked(proto, change) {
          assert.argumentTypes(proto, ProtoRecord, change, $traceurRuntime.type.any);
          this.message = ("Expression '" + proto.expressionAsString + "' has changed after it was checked. ") + ("Previous value: '" + change.previousValue + "'. Current value: '" + change.currentValue + "'");
        };
        return ($traceurRuntime.createClass)(ExpressionChangedAfterItHasBeenChecked, {toString: function() {
            return assert.returnType((this.message), $traceurRuntime.type.string);
          }}, {}, $__super);
      }(Error)));
      Object.defineProperty(ExpressionChangedAfterItHasBeenChecked, "parameters", {get: function() {
          return [[ProtoRecord], [$traceurRuntime.type.any]];
        }});
      ChangeDetectionError = $__export("ChangeDetectionError", (function($__super) {
        var ChangeDetectionError = function ChangeDetectionError(proto, originalException) {
          assert.argumentTypes(proto, ProtoRecord, originalException, $traceurRuntime.type.any);
          this.originalException = originalException;
          this.location = proto.expressionAsString;
          this.message = (this.originalException + " in [" + this.location + "]");
        };
        return ($traceurRuntime.createClass)(ChangeDetectionError, {toString: function() {
            return assert.returnType((this.message), $traceurRuntime.type.string);
          }}, {}, $__super);
      }(Error)));
      Object.defineProperty(ChangeDetectionError, "parameters", {get: function() {
          return [[ProtoRecord], [$traceurRuntime.type.any]];
        }});
    }
  };
});




System.register("change_detection/interfaces", ["rtts_assert/rtts_assert", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/interfaces";
  var assert,
      List,
      ChangeRecord,
      ChangeDispatcher,
      ChangeDetector;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      List = m.List;
    }],
    execute: function() {
      ChangeRecord = $__export("ChangeRecord", (function() {
        var ChangeRecord = function ChangeRecord(bindingMemento, change) {
          this.bindingMemento = bindingMemento;
          this.change = change;
        };
        return ($traceurRuntime.createClass)(ChangeRecord, {
          get currentValue() {
            return this.change.currentValue;
          },
          get previousValue() {
            return this.change.previousValue;
          }
        }, {});
      }()));
      ChangeDispatcher = $__export("ChangeDispatcher", (function() {
        var ChangeDispatcher = function ChangeDispatcher() {};
        return ($traceurRuntime.createClass)(ChangeDispatcher, {onRecordChange: function(groupMemento, records) {
            assert.argumentTypes(groupMemento, $traceurRuntime.type.any, records, List);
          }}, {});
      }()));
      Object.defineProperty(ChangeDispatcher.prototype.onRecordChange, "parameters", {get: function() {
          return [[], [List]];
        }});
      ChangeDetector = $__export("ChangeDetector", (function() {
        var ChangeDetector = function ChangeDetector() {};
        return ($traceurRuntime.createClass)(ChangeDetector, {
          addChild: function(cd) {
            assert.argumentTypes(cd, ChangeDetector);
          },
          removeChild: function(cd) {
            assert.argumentTypes(cd, ChangeDetector);
          },
          remove: function() {},
          setContext: function(context) {
            assert.argumentTypes(context, $traceurRuntime.type.any);
          },
          detectChanges: function() {},
          checkNoChanges: function() {}
        }, {});
      }()));
      Object.defineProperty(ChangeDetector.prototype.addChild, "parameters", {get: function() {
          return [[ChangeDetector]];
        }});
      Object.defineProperty(ChangeDetector.prototype.removeChild, "parameters", {get: function() {
          return [[ChangeDetector]];
        }});
      Object.defineProperty(ChangeDetector.prototype.setContext, "parameters", {get: function() {
          return [[$traceurRuntime.type.any]];
        }});
    }
  };
});




System.register("change_detection/keyvalue_changes", ["rtts_assert/rtts_assert", "facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/keyvalue_changes";
  var assert,
      ListWrapper,
      MapWrapper,
      StringMapWrapper,
      stringify,
      looseIdentical,
      isJsObject,
      KeyValueChanges,
      KVChangeRecord;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      stringify = m.stringify;
      looseIdentical = m.looseIdentical;
      isJsObject = m.isJsObject;
    }],
    execute: function() {
      KeyValueChanges = $__export("KeyValueChanges", (function() {
        var KeyValueChanges = function KeyValueChanges() {
          this._records = MapWrapper.create();
          this._map = null;
          this._mapHead = null;
          this._previousMapHead = null;
          this._changesHead = null;
          this._changesTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
        };
        return ($traceurRuntime.createClass)(KeyValueChanges, {
          get isDirty() {
            return assert.returnType((this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null), $traceurRuntime.type.boolean);
          },
          forEachItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachChangedItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            assert.argumentTypes(fn, Function);
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          check: function(map) {
            var $__0 = this;
            this._reset();
            this._map = map;
            var records = this._records;
            var oldSeqRecord = assert.type(this._mapHead, KVChangeRecord);
            var lastOldSeqRecord = assert.type(null, KVChangeRecord);
            var lastNewSeqRecord = assert.type(null, KVChangeRecord);
            var seqChanged = assert.type(false, $traceurRuntime.type.boolean);
            this._forEach(map, (function(value, key) {
              var newSeqRecord;
              if (oldSeqRecord !== null && key === oldSeqRecord.key) {
                newSeqRecord = oldSeqRecord;
                if (!looseIdentical(value, oldSeqRecord._currentValue)) {
                  oldSeqRecord._previousValue = oldSeqRecord._currentValue;
                  oldSeqRecord._currentValue = value;
                  $__0._addToChanges(oldSeqRecord);
                }
              } else {
                seqChanged = true;
                if (oldSeqRecord !== null) {
                  oldSeqRecord._next = null;
                  $__0._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                  $__0._addToRemovals(oldSeqRecord);
                }
                if (MapWrapper.contains(records, key)) {
                  newSeqRecord = MapWrapper.get(records, key);
                } else {
                  newSeqRecord = new KVChangeRecord(key);
                  MapWrapper.set(records, key, newSeqRecord);
                  newSeqRecord._currentValue = value;
                  $__0._addToAdditions(newSeqRecord);
                }
              }
              if (seqChanged) {
                if ($__0._isInRemovals(newSeqRecord)) {
                  $__0._removeFromRemovals(newSeqRecord);
                }
                if (lastNewSeqRecord == null) {
                  $__0._mapHead = newSeqRecord;
                } else {
                  lastNewSeqRecord._next = newSeqRecord;
                }
              }
              lastOldSeqRecord = oldSeqRecord;
              lastNewSeqRecord = newSeqRecord;
              oldSeqRecord = oldSeqRecord === null ? null : oldSeqRecord._next;
            }));
            this._truncate(lastOldSeqRecord, oldSeqRecord);
            return assert.returnType((this.isDirty), $traceurRuntime.type.boolean);
          },
          _reset: function() {
            if (this.isDirty) {
              var record;
              for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
              }
              for (record = this._changesHead; record !== null; record = record._nextChanged) {
                record._previousValue = record._currentValue;
              }
              for (record = this._additionsHead; record != null; record = record._nextAdded) {
                record._previousValue = record._currentValue;
              }
              this._changesHead = this._changesTail = null;
              this._additionsHead = this._additionsTail = null;
              this._removalsHead = this._removalsTail = null;
            }
          },
          _truncate: function(lastRecord, record) {
            assert.argumentTypes(lastRecord, KVChangeRecord, record, KVChangeRecord);
            while (record !== null) {
              if (lastRecord === null) {
                this._mapHead = null;
              } else {
                lastRecord._next = null;
              }
              var nextRecord = record._next;
              this._addToRemovals(record);
              lastRecord = record;
              record = nextRecord;
            }
            for (var rec = assert.type(this._removalsHead, KVChangeRecord); rec !== null; rec = rec._nextRemoved) {
              rec._previousValue = rec._currentValue;
              rec._currentValue = null;
              MapWrapper.delete(this._records, rec.key);
            }
          },
          _isInRemovals: function(record) {
            assert.argumentTypes(record, KVChangeRecord);
            return record === this._removalsHead || record._nextRemoved !== null || record._prevRemoved !== null;
          },
          _addToRemovals: function(record) {
            assert.argumentTypes(record, KVChangeRecord);
            if (this._removalsHead === null) {
              this._removalsHead = this._removalsTail = record;
            } else {
              this._removalsTail._nextRemoved = record;
              record._prevRemoved = this._removalsTail;
              this._removalsTail = record;
            }
          },
          _removeFromSeq: function(prev, record) {
            assert.argumentTypes(prev, KVChangeRecord, record, KVChangeRecord);
            var next = record._next;
            if (prev === null) {
              this._mapHead = next;
            } else {
              prev._next = next;
            }
          },
          _removeFromRemovals: function(record) {
            assert.argumentTypes(record, KVChangeRecord);
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
              this._removalsHead = next;
            } else {
              prev._nextRemoved = next;
            }
            if (next === null) {
              this._removalsTail = prev;
            } else {
              next._prevRemoved = prev;
            }
            record._prevRemoved = record._nextRemoved = null;
          },
          _addToAdditions: function(record) {
            assert.argumentTypes(record, KVChangeRecord);
            if (this._additionsHead === null) {
              this._additionsHead = this._additionsTail = record;
            } else {
              this._additionsTail._nextAdded = record;
              this._additionsTail = record;
            }
          },
          _addToChanges: function(record) {
            assert.argumentTypes(record, KVChangeRecord);
            if (this._changesHead === null) {
              this._changesHead = this._changesTail = record;
            } else {
              this._changesTail._nextChanged = record;
              this._changesTail = record;
            }
          },
          toString: function() {
            var items = [];
            var previous = [];
            var changes = [];
            var additions = [];
            var removals = [];
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
              ListWrapper.push(items, stringify(record));
            }
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
              ListWrapper.push(previous, stringify(record));
            }
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              ListWrapper.push(changes, stringify(record));
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              ListWrapper.push(additions, stringify(record));
            }
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              ListWrapper.push(removals, stringify(record));
            }
            return assert.returnType(("map: " + items.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n"), $traceurRuntime.type.string);
          },
          _forEach: function(obj, fn) {
            assert.argumentTypes(obj, $traceurRuntime.type.any, fn, Function);
            if (obj instanceof Map) {
              MapWrapper.forEach(obj, fn);
            } else {
              StringMapWrapper.forEach(obj, fn);
            }
          }
        }, {supports: function(obj) {
            return assert.returnType((obj instanceof Map || isJsObject(obj)), $traceurRuntime.type.boolean);
          }});
      }()));
      Object.defineProperty(KeyValueChanges.prototype.forEachItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(KeyValueChanges.prototype.forEachPreviousItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(KeyValueChanges.prototype.forEachChangedItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(KeyValueChanges.prototype.forEachAddedItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(KeyValueChanges.prototype.forEachRemovedItem, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._truncate, "parameters", {get: function() {
          return [[KVChangeRecord], [KVChangeRecord]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._isInRemovals, "parameters", {get: function() {
          return [[KVChangeRecord]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._addToRemovals, "parameters", {get: function() {
          return [[KVChangeRecord]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._removeFromSeq, "parameters", {get: function() {
          return [[KVChangeRecord], [KVChangeRecord]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._removeFromRemovals, "parameters", {get: function() {
          return [[KVChangeRecord]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._addToAdditions, "parameters", {get: function() {
          return [[KVChangeRecord]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._addToChanges, "parameters", {get: function() {
          return [[KVChangeRecord]];
        }});
      Object.defineProperty(KeyValueChanges.prototype._forEach, "parameters", {get: function() {
          return [[], [Function]];
        }});
      KVChangeRecord = $__export("KVChangeRecord", (function() {
        var KVChangeRecord = function KVChangeRecord(key) {
          this.key = key;
          this._previousValue = null;
          this._currentValue = null;
          this._nextPrevious = null;
          this._next = null;
          this._nextAdded = null;
          this._nextRemoved = null;
          this._prevRemoved = null;
          this._nextChanged = null;
        };
        return ($traceurRuntime.createClass)(KVChangeRecord, {toString: function() {
            return assert.returnType((looseIdentical(this._previousValue, this._currentValue) ? stringify(this.key) : (stringify(this.key) + '[' + stringify(this._previousValue) + '->' + stringify(this._currentValue) + ']')), $traceurRuntime.type.string);
          }}, {});
      }()));
    }
  };
});




System.register("change_detection/proto_change_detector", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "./parser/ast", "./parser/context_with_variable_bindings", "./interfaces", "./dynamic_change_detector"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/proto_change_detector";
  var assert,
      isPresent,
      isBlank,
      BaseException,
      List,
      ListWrapper,
      MapWrapper,
      StringMapWrapper,
      AccessMember,
      Assignment,
      AST,
      ASTWithSource,
      AstVisitor,
      Binary,
      Chain,
      Structural,
      Conditional,
      Formatter,
      FunctionCall,
      ImplicitReceiver,
      Interpolation,
      KeyedAccess,
      LiteralArray,
      LiteralMap,
      LiteralPrimitive,
      MethodCall,
      PrefixNot,
      ContextWithVariableBindings,
      ChangeDispatcher,
      ChangeDetector,
      DynamicChangeDetector,
      RECORD_TYPE_SELF,
      RECORD_TYPE_PROPERTY,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_CONST,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_INVOKE_PURE_FUNCTION,
      RECORD_TYPE_INVOKE_FORMATTER,
      RECORD_TYPE_STRUCTURAL_CHECK,
      ProtoRecord,
      ProtoChangeDetector,
      ProtoOperationsCreator;
  function _arrayFn(length) {
    switch (length) {
      case 0:
        return (function() {
          return [];
        });
      case 1:
        return (function(a1) {
          return [a1];
        });
      case 2:
        return (function(a1, a2) {
          return [a1, a2];
        });
      case 3:
        return (function(a1, a2, a3) {
          return [a1, a2, a3];
        });
      case 4:
        return (function(a1, a2, a3, a4) {
          return [a1, a2, a3, a4];
        });
      case 5:
        return (function(a1, a2, a3, a4, a5) {
          return [a1, a2, a3, a4, a5];
        });
      case 6:
        return (function(a1, a2, a3, a4, a5, a6) {
          return [a1, a2, a3, a4, a5, a6];
        });
      case 7:
        return (function(a1, a2, a3, a4, a5, a6, a7) {
          return [a1, a2, a3, a4, a5, a6, a7];
        });
      case 8:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
          return [a1, a2, a3, a4, a5, a6, a7, a8];
        });
      case 9:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return [a1, a2, a3, a4, a5, a6, a7, a8, a9];
        });
      default:
        throw new BaseException("Does not support literal arrays with more than 9 elements");
    }
  }
  function _mapFn(keys, length) {
    function buildMap(values) {
      var res = StringMapWrapper.create();
      for (var i = 0; i < keys.length; ++i) {
        StringMapWrapper.set(res, keys[i], values[i]);
      }
      return res;
    }
    switch (length) {
      case 0:
        return (function() {
          return [];
        });
      case 1:
        return (function(a1) {
          return buildMap([a1]);
        });
      case 2:
        return (function(a1, a2) {
          return buildMap([a1, a2]);
        });
      case 3:
        return (function(a1, a2, a3) {
          return buildMap([a1, a2, a3]);
        });
      case 4:
        return (function(a1, a2, a3, a4) {
          return buildMap([a1, a2, a3, a4]);
        });
      case 5:
        return (function(a1, a2, a3, a4, a5) {
          return buildMap([a1, a2, a3, a4, a5]);
        });
      case 6:
        return (function(a1, a2, a3, a4, a5, a6) {
          return buildMap([a1, a2, a3, a4, a5, a6]);
        });
      case 7:
        return (function(a1, a2, a3, a4, a5, a6, a7) {
          return buildMap([a1, a2, a3, a4, a5, a6, a7]);
        });
      case 8:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
          return buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
        });
      case 9:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
        });
      default:
        throw new BaseException("Does not support literal maps with more than 9 elements");
    }
  }
  function _operationToFunction(operation) {
    assert.argumentTypes(operation, $traceurRuntime.type.string);
    switch (operation) {
      case '+':
        return assert.returnType((_operation_add), Function);
      case '-':
        return assert.returnType((_operation_subtract), Function);
      case '*':
        return assert.returnType((_operation_multiply), Function);
      case '/':
        return assert.returnType((_operation_divide), Function);
      case '%':
        return assert.returnType((_operation_remainder), Function);
      case '==':
        return assert.returnType((_operation_equals), Function);
      case '!=':
        return assert.returnType((_operation_not_equals), Function);
      case '<':
        return assert.returnType((_operation_less_then), Function);
      case '>':
        return assert.returnType((_operation_greater_then), Function);
      case '<=':
        return assert.returnType((_operation_less_or_equals_then), Function);
      case '>=':
        return assert.returnType((_operation_greater_or_equals_then), Function);
      case '&&':
        return assert.returnType((_operation_logical_and), Function);
      case '||':
        return assert.returnType((_operation_logical_or), Function);
      default:
        throw new BaseException(("Unsupported operation " + operation));
    }
  }
  function _operation_negate(value) {
    return !value;
  }
  function _operation_add(left, right) {
    return left + right;
  }
  function _operation_subtract(left, right) {
    return left - right;
  }
  function _operation_multiply(left, right) {
    return left * right;
  }
  function _operation_divide(left, right) {
    return left / right;
  }
  function _operation_remainder(left, right) {
    return left % right;
  }
  function _operation_equals(left, right) {
    return left == right;
  }
  function _operation_not_equals(left, right) {
    return left != right;
  }
  function _operation_less_then(left, right) {
    return left < right;
  }
  function _operation_greater_then(left, right) {
    return left > right;
  }
  function _operation_less_or_equals_then(left, right) {
    return left <= right;
  }
  function _operation_greater_or_equals_then(left, right) {
    return left >= right;
  }
  function _operation_logical_and(left, right) {
    return left && right;
  }
  function _operation_logical_or(left, right) {
    return left || right;
  }
  function _cond(cond, trueVal, falseVal) {
    return cond ? trueVal : falseVal;
  }
  function _keyedAccess(obj, args) {
    return obj[args[0]];
  }
  function s(v) {
    return isPresent(v) ? '' + v : '';
  }
  function _interpolationFn(strings) {
    var length = strings.length;
    var i = -1;
    var c0 = length > ++i ? strings[i] : null;
    var c1 = length > ++i ? strings[i] : null;
    var c2 = length > ++i ? strings[i] : null;
    var c3 = length > ++i ? strings[i] : null;
    var c4 = length > ++i ? strings[i] : null;
    var c5 = length > ++i ? strings[i] : null;
    var c6 = length > ++i ? strings[i] : null;
    var c7 = length > ++i ? strings[i] : null;
    var c8 = length > ++i ? strings[i] : null;
    var c9 = length > ++i ? strings[i] : null;
    switch (length - 1) {
      case 1:
        return (function(a1) {
          return c0 + s(a1) + c1;
        });
      case 2:
        return (function(a1, a2) {
          return c0 + s(a1) + c1 + s(a2) + c2;
        });
      case 3:
        return (function(a1, a2, a3) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3;
        });
      case 4:
        return (function(a1, a2, a3, a4) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4;
        });
      case 5:
        return (function(a1, a2, a3, a4, a5) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5;
        });
      case 6:
        return (function(a1, a2, a3, a4, a5, a6) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6;
        });
      case 7:
        return (function(a1, a2, a3, a4, a5, a6, a7) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7;
        });
      case 8:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8;
        });
      case 9:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8 + s(a9) + c9;
        });
      default:
        throw new BaseException("Does not support more than 9 expressions");
    }
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      BaseException = m.BaseException;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      AccessMember = m.AccessMember;
      Assignment = m.Assignment;
      AST = m.AST;
      ASTWithSource = m.ASTWithSource;
      AstVisitor = m.AstVisitor;
      Binary = m.Binary;
      Chain = m.Chain;
      Structural = m.Structural;
      Conditional = m.Conditional;
      Formatter = m.Formatter;
      FunctionCall = m.FunctionCall;
      ImplicitReceiver = m.ImplicitReceiver;
      Interpolation = m.Interpolation;
      KeyedAccess = m.KeyedAccess;
      LiteralArray = m.LiteralArray;
      LiteralMap = m.LiteralMap;
      LiteralPrimitive = m.LiteralPrimitive;
      MethodCall = m.MethodCall;
      PrefixNot = m.PrefixNot;
    }, function(m) {
      ContextWithVariableBindings = m.ContextWithVariableBindings;
    }, function(m) {
      ChangeDispatcher = m.ChangeDispatcher;
      ChangeDetector = m.ChangeDetector;
    }, function(m) {
      DynamicChangeDetector = m.DynamicChangeDetector;
    }],
    execute: function() {
      RECORD_TYPE_SELF = $__export("RECORD_TYPE_SELF", 0);
      RECORD_TYPE_PROPERTY = $__export("RECORD_TYPE_PROPERTY", 1);
      RECORD_TYPE_INVOKE_METHOD = $__export("RECORD_TYPE_INVOKE_METHOD", 2);
      RECORD_TYPE_CONST = $__export("RECORD_TYPE_CONST", 3);
      RECORD_TYPE_INVOKE_CLOSURE = $__export("RECORD_TYPE_INVOKE_CLOSURE", 4);
      RECORD_TYPE_INVOKE_PURE_FUNCTION = $__export("RECORD_TYPE_INVOKE_PURE_FUNCTION", 5);
      RECORD_TYPE_INVOKE_FORMATTER = $__export("RECORD_TYPE_INVOKE_FORMATTER", 6);
      RECORD_TYPE_STRUCTURAL_CHECK = $__export("RECORD_TYPE_STRUCTURAL_CHECK", 10);
      ProtoRecord = $__export("ProtoRecord", (function() {
        var ProtoRecord = function ProtoRecord(mode, name, funcOrValue, args, contextIndex, record_type_selfIndex, bindingMemento, groupMemento, terminal, expressionAsString) {
          assert.argumentTypes(mode, $traceurRuntime.type.number, name, $traceurRuntime.type.string, funcOrValue, $traceurRuntime.type.any, args, List, contextIndex, $traceurRuntime.type.number, record_type_selfIndex, $traceurRuntime.type.number, bindingMemento, $traceurRuntime.type.any, groupMemento, $traceurRuntime.type.any, terminal, $traceurRuntime.type.boolean, expressionAsString, $traceurRuntime.type.string);
          this.mode = mode;
          this.name = name;
          this.funcOrValue = funcOrValue;
          this.args = args;
          this.contextIndex = contextIndex;
          this.record_type_selfIndex = record_type_selfIndex;
          this.bindingMemento = bindingMemento;
          this.groupMemento = groupMemento;
          this.terminal = terminal;
          this.expressionAsString = expressionAsString;
        };
        return ($traceurRuntime.createClass)(ProtoRecord, {}, {});
      }()));
      Object.defineProperty(ProtoRecord, "parameters", {get: function() {
          return [[$traceurRuntime.type.number], [$traceurRuntime.type.string], [], [List], [$traceurRuntime.type.number], [$traceurRuntime.type.number], [$traceurRuntime.type.any], [$traceurRuntime.type.any], [$traceurRuntime.type.boolean], [$traceurRuntime.type.string]];
        }});
      ProtoChangeDetector = $__export("ProtoChangeDetector", (function() {
        var ProtoChangeDetector = function ProtoChangeDetector() {
          this.records = [];
        };
        return ($traceurRuntime.createClass)(ProtoChangeDetector, {
          addAst: function(ast, bindingMemento) {
            var groupMemento = arguments[2] !== (void 0) ? arguments[2] : null;
            var structural = arguments[3] !== (void 0) ? arguments[3] : false;
            assert.argumentTypes(ast, AST, bindingMemento, $traceurRuntime.type.any, groupMemento, $traceurRuntime.type.any, structural, $traceurRuntime.type.boolean);
            if (structural)
              ast = new Structural(ast);
            var c = new ProtoOperationsCreator(bindingMemento, groupMemento, this.records.length, ast.toString());
            ast.visit(c);
            if (!ListWrapper.isEmpty(c.protoRecords)) {
              var last = ListWrapper.last(c.protoRecords);
              last.terminal = true;
              this.records = ListWrapper.concat(this.records, c.protoRecords);
            }
          },
          instantiate: function(dispatcher, formatters) {
            assert.argumentTypes(dispatcher, $traceurRuntime.type.any, formatters, Map);
            return new DynamicChangeDetector(dispatcher, formatters, this.records);
          }
        }, {});
      }()));
      Object.defineProperty(ProtoChangeDetector.prototype.addAst, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.any], [$traceurRuntime.type.any], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(ProtoChangeDetector.prototype.instantiate, "parameters", {get: function() {
          return [[$traceurRuntime.type.any], [Map]];
        }});
      ProtoOperationsCreator = (function() {
        var ProtoOperationsCreator = function ProtoOperationsCreator(bindingMemento, groupMemento, contextIndex, expressionAsString) {
          assert.argumentTypes(bindingMemento, $traceurRuntime.type.any, groupMemento, $traceurRuntime.type.any, contextIndex, $traceurRuntime.type.number, expressionAsString, $traceurRuntime.type.string);
          this.protoRecords = [];
          this.bindingMemento = bindingMemento;
          this.groupMemento = groupMemento;
          this.contextIndex = contextIndex;
          this.expressionAsString = expressionAsString;
        };
        return ($traceurRuntime.createClass)(ProtoOperationsCreator, {
          visitImplicitReceiver: function(ast) {
            assert.argumentTypes(ast, ImplicitReceiver);
            return 0;
          },
          visitInterpolation: function(ast) {
            assert.argumentTypes(ast, Interpolation);
            var args = this._visitAll(ast.expressions);
            return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "Interpolate()", _interpolationFn(ast.strings), args, 0);
          },
          visitLiteralPrimitive: function(ast) {
            assert.argumentTypes(ast, LiteralPrimitive);
            return this._addRecord(RECORD_TYPE_CONST, null, ast.value, [], 0);
          },
          visitAccessMember: function(ast) {
            assert.argumentTypes(ast, AccessMember);
            var receiver = ast.receiver.visit(this);
            return this._addRecord(RECORD_TYPE_PROPERTY, ast.name, ast.getter, [], receiver);
          },
          visitFormatter: function(ast) {
            assert.argumentTypes(ast, Formatter);
            return this._addRecord(RECORD_TYPE_INVOKE_FORMATTER, ast.name, ast.name, this._visitAll(ast.allArgs), 0);
          },
          visitMethodCall: function(ast) {
            assert.argumentTypes(ast, MethodCall);
            var receiver = ast.receiver.visit(this);
            var args = this._visitAll(ast.args);
            return this._addRecord(RECORD_TYPE_INVOKE_METHOD, ast.name, ast.fn, args, receiver);
          },
          visitFunctionCall: function(ast) {
            assert.argumentTypes(ast, FunctionCall);
            var target = ast.target.visit(this);
            var args = this._visitAll(ast.args);
            return this._addRecord(RECORD_TYPE_INVOKE_CLOSURE, null, null, args, target);
          },
          visitLiteralArray: function(ast) {
            assert.argumentTypes(ast, LiteralArray);
            return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "Array()", _arrayFn(ast.expressions.length), this._visitAll(ast.expressions), 0);
          },
          visitLiteralMap: function(ast) {
            assert.argumentTypes(ast, LiteralMap);
            return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "Map()", _mapFn(ast.keys, ast.values.length), this._visitAll(ast.values), 0);
          },
          visitBinary: function(ast) {
            assert.argumentTypes(ast, Binary);
            var left = ast.left.visit(this);
            var right = ast.right.visit(this);
            return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, ast.operation, _operationToFunction(ast.operation), [left, right], 0);
          },
          visitPrefixNot: function(ast) {
            assert.argumentTypes(ast, PrefixNot);
            var exp = ast.expression.visit(this);
            return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "-", _operation_negate, [exp], 0);
          },
          visitConditional: function(ast) {
            assert.argumentTypes(ast, Conditional);
            var c = ast.condition.visit(this);
            var t = ast.trueExp.visit(this);
            var f = ast.falseExp.visit(this);
            return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "?:", _cond, [c, t, f], 0);
          },
          visitStructural: function(ast) {
            assert.argumentTypes(ast, Structural);
            var value = ast.value.visit(this);
            return this._addRecord(RECORD_TYPE_STRUCTURAL_CHECK, "record_type_structural_check", null, [], value);
          },
          visitKeyedAccess: function(ast) {
            assert.argumentTypes(ast, KeyedAccess);
            var obj = ast.obj.visit(this);
            var key = ast.key.visit(this);
            return this._addRecord(RECORD_TYPE_INVOKE_METHOD, "[]", _keyedAccess, [key], obj);
          },
          _visitAll: function(asts) {
            assert.argumentTypes(asts, List);
            var res = ListWrapper.createFixedSize(asts.length);
            for (var i = 0; i < asts.length; ++i) {
              res[i] = asts[i].visit(this);
            }
            return res;
          },
          _addRecord: function(type, name, funcOrValue, args, context) {
            var record_type_selfIndex = ++this.contextIndex;
            ListWrapper.push(this.protoRecords, new ProtoRecord(type, name, funcOrValue, args, context, record_type_selfIndex, this.bindingMemento, this.groupMemento, false, this.expressionAsString));
            return record_type_selfIndex;
          }
        }, {});
      }());
      Object.defineProperty(ProtoOperationsCreator, "parameters", {get: function() {
          return [[$traceurRuntime.type.any], [$traceurRuntime.type.any], [$traceurRuntime.type.number], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitImplicitReceiver, "parameters", {get: function() {
          return [[ImplicitReceiver]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitInterpolation, "parameters", {get: function() {
          return [[Interpolation]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitLiteralPrimitive, "parameters", {get: function() {
          return [[LiteralPrimitive]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitAccessMember, "parameters", {get: function() {
          return [[AccessMember]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitFormatter, "parameters", {get: function() {
          return [[Formatter]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitMethodCall, "parameters", {get: function() {
          return [[MethodCall]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitFunctionCall, "parameters", {get: function() {
          return [[FunctionCall]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitLiteralArray, "parameters", {get: function() {
          return [[LiteralArray]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitLiteralMap, "parameters", {get: function() {
          return [[LiteralMap]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitBinary, "parameters", {get: function() {
          return [[Binary]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitPrefixNot, "parameters", {get: function() {
          return [[PrefixNot]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitConditional, "parameters", {get: function() {
          return [[Conditional]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitStructural, "parameters", {get: function() {
          return [[Structural]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype.visitKeyedAccess, "parameters", {get: function() {
          return [[KeyedAccess]];
        }});
      Object.defineProperty(ProtoOperationsCreator.prototype._visitAll, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(_arrayFn, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(_mapFn, "parameters", {get: function() {
          return [[List], [int]];
        }});
      Object.defineProperty(_operationToFunction, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_interpolationFn, "parameters", {get: function() {
          return [[List]];
        }});
    }
  };
});




System.register("change_detection/parser/ast", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "./context_with_variable_bindings"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/ast";
  var assert,
      FIELD,
      autoConvertAdd,
      isBlank,
      isPresent,
      FunctionWrapper,
      BaseException,
      List,
      Map,
      ListWrapper,
      StringMapWrapper,
      ContextWithVariableBindings,
      AST,
      EmptyExpr,
      Structural,
      ImplicitReceiver,
      Chain,
      Conditional,
      AccessMember,
      KeyedAccess,
      Formatter,
      LiteralPrimitive,
      LiteralArray,
      LiteralMap,
      Interpolation,
      Binary,
      PrefixNot,
      Assignment,
      MethodCall,
      FunctionCall,
      ASTWithSource,
      TemplateBinding,
      AstVisitor,
      _evalListCache;
  function evalList(context, exps) {
    assert.argumentTypes(context, $traceurRuntime.type.any, exps, List);
    var length = exps.length;
    var result = _evalListCache[length];
    for (var i = 0; i < length; i++) {
      result[i] = exps[i].eval(context);
    }
    return result;
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      FIELD = m.FIELD;
      autoConvertAdd = m.autoConvertAdd;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      FunctionWrapper = m.FunctionWrapper;
      BaseException = m.BaseException;
    }, function(m) {
      List = m.List;
      Map = m.Map;
      ListWrapper = m.ListWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      ContextWithVariableBindings = m.ContextWithVariableBindings;
    }],
    execute: function() {
      AST = $__export("AST", (function() {
        var AST = function AST() {};
        return ($traceurRuntime.createClass)(AST, {
          eval: function(context) {
            throw new BaseException("Not supported");
          },
          get isAssignable() {
            return false;
          },
          assign: function(context, value) {
            throw new BaseException("Not supported");
          },
          visit: function(visitor) {},
          toString: function() {
            return assert.returnType(("AST"), $traceurRuntime.type.string);
          }
        }, {});
      }()));
      EmptyExpr = $__export("EmptyExpr", (function($__super) {
        var EmptyExpr = function EmptyExpr() {
          $traceurRuntime.superConstructor(EmptyExpr).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(EmptyExpr, {
          eval: function(context) {
            return null;
          },
          visit: function(visitor) {}
        }, {}, $__super);
      }(AST)));
      Structural = $__export("Structural", (function($__super) {
        var Structural = function Structural(value) {
          assert.argumentTypes(value, AST);
          this.value = value;
        };
        return ($traceurRuntime.createClass)(Structural, {
          eval: function(context) {
            return value.eval(context);
          },
          visit: function(visitor) {
            return visitor.visitStructural(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Structural, "parameters", {get: function() {
          return [[AST]];
        }});
      ImplicitReceiver = $__export("ImplicitReceiver", (function($__super) {
        var ImplicitReceiver = function ImplicitReceiver() {
          $traceurRuntime.superConstructor(ImplicitReceiver).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(ImplicitReceiver, {
          eval: function(context) {
            return context;
          },
          visit: function(visitor) {
            return visitor.visitImplicitReceiver(this);
          }
        }, {}, $__super);
      }(AST)));
      Chain = $__export("Chain", (function($__super) {
        var Chain = function Chain(expressions) {
          assert.argumentTypes(expressions, List);
          this.expressions = expressions;
        };
        return ($traceurRuntime.createClass)(Chain, {
          eval: function(context) {
            var result;
            for (var i = 0; i < this.expressions.length; i++) {
              var last = this.expressions[i].eval(context);
              if (isPresent(last))
                result = last;
            }
            return result;
          },
          visit: function(visitor) {
            return visitor.visitChain(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Chain, "parameters", {get: function() {
          return [[List]];
        }});
      Conditional = $__export("Conditional", (function($__super) {
        var Conditional = function Conditional(condition, trueExp, falseExp) {
          assert.argumentTypes(condition, AST, trueExp, AST, falseExp, AST);
          this.condition = condition;
          this.trueExp = trueExp;
          this.falseExp = falseExp;
        };
        return ($traceurRuntime.createClass)(Conditional, {
          eval: function(context) {
            if (this.condition.eval(context)) {
              return this.trueExp.eval(context);
            } else {
              return this.falseExp.eval(context);
            }
          },
          visit: function(visitor) {
            return visitor.visitConditional(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Conditional, "parameters", {get: function() {
          return [[AST], [AST], [AST]];
        }});
      AccessMember = $__export("AccessMember", (function($__super) {
        var AccessMember = function AccessMember(receiver, name, getter, setter) {
          assert.argumentTypes(receiver, AST, name, $traceurRuntime.type.string, getter, Function, setter, Function);
          this.receiver = receiver;
          this.name = name;
          this.getter = getter;
          this.setter = setter;
        };
        return ($traceurRuntime.createClass)(AccessMember, {
          eval: function(context) {
            var evaluatedContext = this.receiver.eval(context);
            while (evaluatedContext instanceof ContextWithVariableBindings) {
              if (evaluatedContext.hasBinding(this.name)) {
                return evaluatedContext.get(this.name);
              }
              evaluatedContext = evaluatedContext.parent;
            }
            return this.getter(evaluatedContext);
          },
          get isAssignable() {
            return true;
          },
          assign: function(context, value) {
            var evaluatedContext = this.receiver.eval(context);
            while (evaluatedContext instanceof ContextWithVariableBindings) {
              if (evaluatedContext.hasBinding(this.name)) {
                throw new BaseException(("Cannot reassign a variable binding " + this.name));
              }
              evaluatedContext = evaluatedContext.parent;
            }
            return this.setter(evaluatedContext, value);
          },
          visit: function(visitor) {
            return visitor.visitAccessMember(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(AccessMember, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [Function], [Function]];
        }});
      KeyedAccess = $__export("KeyedAccess", (function($__super) {
        var KeyedAccess = function KeyedAccess(obj, key) {
          assert.argumentTypes(obj, AST, key, AST);
          this.obj = obj;
          this.key = key;
        };
        return ($traceurRuntime.createClass)(KeyedAccess, {
          eval: function(context) {
            var obj = this.obj.eval(context);
            var key = this.key.eval(context);
            return obj[key];
          },
          get isAssignable() {
            return true;
          },
          assign: function(context, value) {
            var obj = this.obj.eval(context);
            var key = this.key.eval(context);
            obj[key] = value;
            return value;
          },
          visit: function(visitor) {
            return visitor.visitKeyedAccess(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(KeyedAccess, "parameters", {get: function() {
          return [[AST], [AST]];
        }});
      Formatter = $__export("Formatter", (function($__super) {
        var Formatter = function Formatter(exp, name, args) {
          assert.argumentTypes(exp, AST, name, $traceurRuntime.type.string, args, List);
          this.exp = exp;
          this.name = name;
          this.args = args;
          this.allArgs = ListWrapper.concat([exp], args);
        };
        return ($traceurRuntime.createClass)(Formatter, {visit: function(visitor) {
            return visitor.visitFormatter(this);
          }}, {}, $__super);
      }(AST)));
      Object.defineProperty(Formatter, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [List]];
        }});
      LiteralPrimitive = $__export("LiteralPrimitive", (function($__super) {
        var LiteralPrimitive = function LiteralPrimitive(value) {
          this.value = value;
        };
        return ($traceurRuntime.createClass)(LiteralPrimitive, {
          eval: function(context) {
            return this.value;
          },
          visit: function(visitor) {
            return visitor.visitLiteralPrimitive(this);
          }
        }, {}, $__super);
      }(AST)));
      LiteralArray = $__export("LiteralArray", (function($__super) {
        var LiteralArray = function LiteralArray(expressions) {
          assert.argumentTypes(expressions, List);
          this.expressions = expressions;
        };
        return ($traceurRuntime.createClass)(LiteralArray, {
          eval: function(context) {
            return ListWrapper.map(this.expressions, (function(e) {
              return e.eval(context);
            }));
          },
          visit: function(visitor) {
            return visitor.visitLiteralArray(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(LiteralArray, "parameters", {get: function() {
          return [[List]];
        }});
      LiteralMap = $__export("LiteralMap", (function($__super) {
        var LiteralMap = function LiteralMap(keys, values) {
          assert.argumentTypes(keys, List, values, List);
          this.keys = keys;
          this.values = values;
        };
        return ($traceurRuntime.createClass)(LiteralMap, {
          eval: function(context) {
            var res = StringMapWrapper.create();
            for (var i = 0; i < this.keys.length; ++i) {
              StringMapWrapper.set(res, this.keys[i], this.values[i].eval(context));
            }
            return res;
          },
          visit: function(visitor) {
            return visitor.visitLiteralMap(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(LiteralMap, "parameters", {get: function() {
          return [[List], [List]];
        }});
      Interpolation = $__export("Interpolation", (function($__super) {
        var Interpolation = function Interpolation(strings, expressions) {
          assert.argumentTypes(strings, List, expressions, List);
          this.strings = strings;
          this.expressions = expressions;
        };
        return ($traceurRuntime.createClass)(Interpolation, {
          eval: function(context) {
            throw new BaseException("evaluating an Interpolation is not supported");
          },
          visit: function(visitor) {
            visitor.visitInterpolation(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Interpolation, "parameters", {get: function() {
          return [[List], [List]];
        }});
      Binary = $__export("Binary", (function($__super) {
        var Binary = function Binary(operation, left, right) {
          assert.argumentTypes(operation, $traceurRuntime.type.string, left, AST, right, AST);
          this.operation = operation;
          this.left = left;
          this.right = right;
        };
        return ($traceurRuntime.createClass)(Binary, {
          eval: function(context) {
            var left = this.left.eval(context);
            switch (this.operation) {
              case '&&':
                return left && this.right.eval(context);
              case '||':
                return left || this.right.eval(context);
            }
            var right = this.right.eval(context);
            switch (this.operation) {
              case '+':
                return left + right;
              case '-':
                return left - right;
              case '*':
                return left * right;
              case '/':
                return left / right;
              case '%':
                return left % right;
              case '==':
                return left == right;
              case '!=':
                return left != right;
              case '<':
                return left < right;
              case '>':
                return left > right;
              case '<=':
                return left <= right;
              case '>=':
                return left >= right;
              case '^':
                return left ^ right;
              case '&':
                return left & right;
            }
            throw 'Internal error [$operation] not handled';
          },
          visit: function(visitor) {
            return visitor.visitBinary(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Binary, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [AST], [AST]];
        }});
      PrefixNot = $__export("PrefixNot", (function($__super) {
        var PrefixNot = function PrefixNot(expression) {
          assert.argumentTypes(expression, AST);
          this.expression = expression;
        };
        return ($traceurRuntime.createClass)(PrefixNot, {
          eval: function(context) {
            return !this.expression.eval(context);
          },
          visit: function(visitor) {
            return visitor.visitPrefixNot(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(PrefixNot, "parameters", {get: function() {
          return [[AST]];
        }});
      Assignment = $__export("Assignment", (function($__super) {
        var Assignment = function Assignment(target, value) {
          assert.argumentTypes(target, AST, value, AST);
          this.target = target;
          this.value = value;
        };
        return ($traceurRuntime.createClass)(Assignment, {
          eval: function(context) {
            return this.target.assign(context, this.value.eval(context));
          },
          visit: function(visitor) {
            return visitor.visitAssignment(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Assignment, "parameters", {get: function() {
          return [[AST], [AST]];
        }});
      MethodCall = $__export("MethodCall", (function($__super) {
        var MethodCall = function MethodCall(receiver, name, fn, args) {
          assert.argumentTypes(receiver, AST, name, $traceurRuntime.type.string, fn, Function, args, List);
          this.receiver = receiver;
          this.fn = fn;
          this.args = args;
          this.name = name;
        };
        return ($traceurRuntime.createClass)(MethodCall, {
          eval: function(context) {
            var evaluatedContext = this.receiver.eval(context);
            var evaluatedArgs = evalList(context, this.args);
            while (evaluatedContext instanceof ContextWithVariableBindings) {
              if (evaluatedContext.hasBinding(this.name)) {
                var fn = evaluatedContext.get(this.name);
                return FunctionWrapper.apply(fn, evaluatedArgs);
              }
              evaluatedContext = evaluatedContext.parent;
            }
            return this.fn(evaluatedContext, evaluatedArgs);
          },
          visit: function(visitor) {
            return visitor.visitMethodCall(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(MethodCall, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [Function], [List]];
        }});
      FunctionCall = $__export("FunctionCall", (function($__super) {
        var FunctionCall = function FunctionCall(target, args) {
          assert.argumentTypes(target, AST, args, List);
          this.target = target;
          this.args = args;
        };
        return ($traceurRuntime.createClass)(FunctionCall, {
          eval: function(context) {
            var obj = this.target.eval(context);
            if (!(obj instanceof Function)) {
              throw new BaseException((obj + " is not a function"));
            }
            return FunctionWrapper.apply(obj, evalList(context, this.args));
          },
          visit: function(visitor) {
            return visitor.visitFunctionCall(this);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(FunctionCall, "parameters", {get: function() {
          return [[AST], [List]];
        }});
      ASTWithSource = $__export("ASTWithSource", (function($__super) {
        var ASTWithSource = function ASTWithSource(ast, source, location) {
          assert.argumentTypes(ast, AST, source, $traceurRuntime.type.string, location, $traceurRuntime.type.string);
          this.source = source;
          this.location = location;
          this.ast = ast;
        };
        return ($traceurRuntime.createClass)(ASTWithSource, {
          eval: function(context) {
            return this.ast.eval(context);
          },
          get isAssignable() {
            return this.ast.isAssignable;
          },
          assign: function(context, value) {
            return this.ast.assign(context, value);
          },
          visit: function(visitor) {
            return this.ast.visit(visitor);
          },
          toString: function() {
            return assert.returnType(((this.source + " in " + this.location)), $traceurRuntime.type.string);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(ASTWithSource, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      TemplateBinding = $__export("TemplateBinding", (function() {
        var TemplateBinding = function TemplateBinding(key, name, expression) {
          assert.argumentTypes(key, $traceurRuntime.type.string, name, $traceurRuntime.type.string, expression, ASTWithSource);
          this.key = key;
          this.name = name;
          this.expression = expression;
        };
        return ($traceurRuntime.createClass)(TemplateBinding, {}, {});
      }()));
      Object.defineProperty(TemplateBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string], [ASTWithSource]];
        }});
      AstVisitor = $__export("AstVisitor", (function() {
        var AstVisitor = function AstVisitor() {};
        return ($traceurRuntime.createClass)(AstVisitor, {
          visitAccessMember: function(ast) {
            assert.argumentTypes(ast, AccessMember);
          },
          visitAssignment: function(ast) {
            assert.argumentTypes(ast, Assignment);
          },
          visitBinary: function(ast) {
            assert.argumentTypes(ast, Binary);
          },
          visitChain: function(ast) {
            assert.argumentTypes(ast, Chain);
          },
          visitStructural: function(ast) {
            assert.argumentTypes(ast, Structural);
          },
          visitConditional: function(ast) {
            assert.argumentTypes(ast, Conditional);
          },
          visitFormatter: function(ast) {
            assert.argumentTypes(ast, Formatter);
          },
          visitFunctionCall: function(ast) {
            assert.argumentTypes(ast, FunctionCall);
          },
          visitImplicitReceiver: function(ast) {
            assert.argumentTypes(ast, ImplicitReceiver);
          },
          visitKeyedAccess: function(ast) {
            assert.argumentTypes(ast, KeyedAccess);
          },
          visitLiteralArray: function(ast) {
            assert.argumentTypes(ast, LiteralArray);
          },
          visitLiteralMap: function(ast) {
            assert.argumentTypes(ast, LiteralMap);
          },
          visitLiteralPrimitive: function(ast) {
            assert.argumentTypes(ast, LiteralPrimitive);
          },
          visitMethodCall: function(ast) {
            assert.argumentTypes(ast, MethodCall);
          },
          visitPrefixNot: function(ast) {
            assert.argumentTypes(ast, PrefixNot);
          }
        }, {});
      }()));
      Object.defineProperty(AstVisitor.prototype.visitAccessMember, "parameters", {get: function() {
          return [[AccessMember]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitAssignment, "parameters", {get: function() {
          return [[Assignment]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitBinary, "parameters", {get: function() {
          return [[Binary]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitChain, "parameters", {get: function() {
          return [[Chain]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitStructural, "parameters", {get: function() {
          return [[Structural]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitConditional, "parameters", {get: function() {
          return [[Conditional]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitFormatter, "parameters", {get: function() {
          return [[Formatter]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitFunctionCall, "parameters", {get: function() {
          return [[FunctionCall]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitImplicitReceiver, "parameters", {get: function() {
          return [[ImplicitReceiver]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitKeyedAccess, "parameters", {get: function() {
          return [[KeyedAccess]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitLiteralArray, "parameters", {get: function() {
          return [[LiteralArray]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitLiteralMap, "parameters", {get: function() {
          return [[LiteralMap]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitLiteralPrimitive, "parameters", {get: function() {
          return [[LiteralPrimitive]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitMethodCall, "parameters", {get: function() {
          return [[MethodCall]];
        }});
      Object.defineProperty(AstVisitor.prototype.visitPrefixNot, "parameters", {get: function() {
          return [[PrefixNot]];
        }});
      _evalListCache = [[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0]];
      Object.defineProperty(evalList, "parameters", {get: function() {
          return [[], [List]];
        }});
    }
  };
});




System.register("change_detection/parser/context_with_variable_bindings", ["rtts_assert/rtts_assert", "facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/context_with_variable_bindings";
  var assert,
      MapWrapper,
      BaseException,
      ContextWithVariableBindings;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      MapWrapper = m.MapWrapper;
    }, function(m) {
      BaseException = m.BaseException;
    }],
    execute: function() {
      ContextWithVariableBindings = $__export("ContextWithVariableBindings", (function() {
        var ContextWithVariableBindings = function ContextWithVariableBindings(parent, varBindings) {
          assert.argumentTypes(parent, $traceurRuntime.type.any, varBindings, Map);
          this.parent = parent;
          this.varBindings = varBindings;
        };
        return ($traceurRuntime.createClass)(ContextWithVariableBindings, {
          hasBinding: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            return assert.returnType((MapWrapper.contains(this.varBindings, name)), $traceurRuntime.type.boolean);
          },
          get: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            return MapWrapper.get(this.varBindings, name);
          },
          set: function(name, value) {
            assert.argumentTypes(name, $traceurRuntime.type.string, value, $traceurRuntime.type.any);
            if (this.hasBinding(name)) {
              MapWrapper.set(this.varBindings, name, value);
            } else {
              throw new BaseException('VariableBindings do not support setting of new keys post-construction.');
            }
          },
          clearValues: function() {
            for (var $__1 = MapWrapper.keys(this.varBindings)[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__2 = void 0; !($__2 = $__1.next()).done; ) {
              var k = $__2.value;
              {
                MapWrapper.set(this.varBindings, k, null);
              }
            }
          }
        }, {});
      }()));
      Object.defineProperty(ContextWithVariableBindings, "parameters", {get: function() {
          return [[$traceurRuntime.type.any], [Map]];
        }});
      Object.defineProperty(ContextWithVariableBindings.prototype.hasBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(ContextWithVariableBindings.prototype.get, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(ContextWithVariableBindings.prototype.set, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], []];
        }});
    }
  };
});




System.register("change_detection/parser/lexer", ["rtts_assert/rtts_assert", "facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/lexer";
  var assert,
      List,
      ListWrapper,
      SetWrapper,
      int,
      FIELD,
      NumberWrapper,
      StringJoiner,
      StringWrapper,
      TOKEN_TYPE_CHARACTER,
      TOKEN_TYPE_IDENTIFIER,
      TOKEN_TYPE_KEYWORD,
      TOKEN_TYPE_STRING,
      TOKEN_TYPE_OPERATOR,
      TOKEN_TYPE_NUMBER,
      Lexer,
      Token,
      EOF,
      $EOF,
      $TAB,
      $LF,
      $VTAB,
      $FF,
      $CR,
      $SPACE,
      $BANG,
      $DQ,
      $HASH,
      $$,
      $PERCENT,
      $AMPERSAND,
      $SQ,
      $LPAREN,
      $RPAREN,
      $STAR,
      $PLUS,
      $COMMA,
      $MINUS,
      $PERIOD,
      $SLASH,
      $COLON,
      $SEMICOLON,
      $LT,
      $EQ,
      $GT,
      $QUESTION,
      $0,
      $9,
      $A,
      $B,
      $C,
      $D,
      $E,
      $F,
      $G,
      $H,
      $I,
      $J,
      $K,
      $L,
      $M,
      $N,
      $O,
      $P,
      $Q,
      $R,
      $S,
      $T,
      $U,
      $V,
      $W,
      $X,
      $Y,
      $Z,
      $LBRACKET,
      $BACKSLASH,
      $RBRACKET,
      $CARET,
      $_,
      $a,
      $b,
      $c,
      $d,
      $e,
      $f,
      $g,
      $h,
      $i,
      $j,
      $k,
      $l,
      $m,
      $n,
      $o,
      $p,
      $q,
      $r,
      $s,
      $t,
      $u,
      $v,
      $w,
      $x,
      $y,
      $z,
      $LBRACE,
      $BAR,
      $RBRACE,
      $TILDE,
      $NBSP,
      ScannerError,
      _Scanner,
      OPERATORS,
      KEYWORDS;
  function newCharacterToken(index, code) {
    assert.argumentTypes(index, int, code, int);
    return assert.returnType((new Token(index, TOKEN_TYPE_CHARACTER, code, StringWrapper.fromCharCode(code))), Token);
  }
  function newIdentifierToken(index, text) {
    assert.argumentTypes(index, int, text, $traceurRuntime.type.string);
    return assert.returnType((new Token(index, TOKEN_TYPE_IDENTIFIER, 0, text)), Token);
  }
  function newKeywordToken(index, text) {
    assert.argumentTypes(index, int, text, $traceurRuntime.type.string);
    return assert.returnType((new Token(index, TOKEN_TYPE_KEYWORD, 0, text)), Token);
  }
  function newOperatorToken(index, text) {
    assert.argumentTypes(index, int, text, $traceurRuntime.type.string);
    return assert.returnType((new Token(index, TOKEN_TYPE_OPERATOR, 0, text)), Token);
  }
  function newStringToken(index, text) {
    assert.argumentTypes(index, int, text, $traceurRuntime.type.string);
    return assert.returnType((new Token(index, TOKEN_TYPE_STRING, 0, text)), Token);
  }
  function newNumberToken(index, n) {
    assert.argumentTypes(index, int, n, $traceurRuntime.type.number);
    return assert.returnType((new Token(index, TOKEN_TYPE_NUMBER, n, "")), Token);
  }
  function isWhitespace(code) {
    assert.argumentTypes(code, int);
    return assert.returnType(((code >= $TAB && code <= $SPACE) || (code == $NBSP)), $traceurRuntime.type.boolean);
  }
  function isIdentifierStart(code) {
    assert.argumentTypes(code, int);
    return assert.returnType((($a <= code && code <= $z) || ($A <= code && code <= $Z) || (code == $_) || (code == $$)), $traceurRuntime.type.boolean);
  }
  function isIdentifierPart(code) {
    assert.argumentTypes(code, int);
    return assert.returnType((($a <= code && code <= $z) || ($A <= code && code <= $Z) || ($0 <= code && code <= $9) || (code == $_) || (code == $$)), $traceurRuntime.type.boolean);
  }
  function isDigit(code) {
    assert.argumentTypes(code, int);
    return assert.returnType(($0 <= code && code <= $9), $traceurRuntime.type.boolean);
  }
  function isExponentStart(code) {
    assert.argumentTypes(code, int);
    return assert.returnType((code == $e || code == $E), $traceurRuntime.type.boolean);
  }
  function isExponentSign(code) {
    assert.argumentTypes(code, int);
    return assert.returnType((code == $MINUS || code == $PLUS), $traceurRuntime.type.boolean);
  }
  function unescape(code) {
    assert.argumentTypes(code, int);
    switch (code) {
      case $n:
        return assert.returnType(($LF), int);
      case $f:
        return assert.returnType(($FF), int);
      case $r:
        return assert.returnType(($CR), int);
      case $t:
        return assert.returnType(($TAB), int);
      case $v:
        return assert.returnType(($VTAB), int);
      default:
        return assert.returnType((code), int);
    }
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
      SetWrapper = m.SetWrapper;
    }, function(m) {
      int = m.int;
      FIELD = m.FIELD;
      NumberWrapper = m.NumberWrapper;
      StringJoiner = m.StringJoiner;
      StringWrapper = m.StringWrapper;
    }],
    execute: function() {
      TOKEN_TYPE_CHARACTER = $__export("TOKEN_TYPE_CHARACTER", 1);
      TOKEN_TYPE_IDENTIFIER = $__export("TOKEN_TYPE_IDENTIFIER", 2);
      TOKEN_TYPE_KEYWORD = $__export("TOKEN_TYPE_KEYWORD", 3);
      TOKEN_TYPE_STRING = $__export("TOKEN_TYPE_STRING", 4);
      TOKEN_TYPE_OPERATOR = $__export("TOKEN_TYPE_OPERATOR", 5);
      TOKEN_TYPE_NUMBER = $__export("TOKEN_TYPE_NUMBER", 6);
      Lexer = $__export("Lexer", (function() {
        var Lexer = function Lexer() {};
        return ($traceurRuntime.createClass)(Lexer, {tokenize: function(text) {
            assert.argumentTypes(text, $traceurRuntime.type.string);
            var scanner = new _Scanner(text);
            var tokens = [];
            var token = scanner.scanToken();
            while (token != null) {
              ListWrapper.push(tokens, token);
              token = scanner.scanToken();
            }
            return assert.returnType((tokens), List);
          }}, {});
      }()));
      Object.defineProperty(Lexer.prototype.tokenize, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Token = $__export("Token", (function() {
        var Token = function Token(index, type, numValue, strValue) {
          assert.argumentTypes(index, int, type, int, numValue, $traceurRuntime.type.number, strValue, $traceurRuntime.type.string);
          this.index = index;
          this.type = type;
          this._numValue = numValue;
          this._strValue = strValue;
        };
        return ($traceurRuntime.createClass)(Token, {
          isCharacter: function(code) {
            assert.argumentTypes(code, int);
            return assert.returnType(((this.type == TOKEN_TYPE_CHARACTER && this._numValue == code)), $traceurRuntime.type.boolean);
          },
          isNumber: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_NUMBER)), $traceurRuntime.type.boolean);
          },
          isString: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_STRING)), $traceurRuntime.type.boolean);
          },
          isOperator: function(operater) {
            assert.argumentTypes(operater, $traceurRuntime.type.string);
            return assert.returnType(((this.type == TOKEN_TYPE_OPERATOR && this._strValue == operater)), $traceurRuntime.type.boolean);
          },
          isIdentifier: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_IDENTIFIER)), $traceurRuntime.type.boolean);
          },
          isKeyword: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_KEYWORD)), $traceurRuntime.type.boolean);
          },
          isKeywordNull: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_KEYWORD && this._strValue == "null")), $traceurRuntime.type.boolean);
          },
          isKeywordUndefined: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_KEYWORD && this._strValue == "undefined")), $traceurRuntime.type.boolean);
          },
          isKeywordTrue: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_KEYWORD && this._strValue == "true")), $traceurRuntime.type.boolean);
          },
          isKeywordFalse: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_KEYWORD && this._strValue == "false")), $traceurRuntime.type.boolean);
          },
          toNumber: function() {
            return assert.returnType(((this.type == TOKEN_TYPE_NUMBER) ? this._numValue : -1), $traceurRuntime.type.number);
          },
          toString: function() {
            var type = assert.type(this.type, int);
            if (type >= TOKEN_TYPE_CHARACTER && type <= TOKEN_TYPE_STRING) {
              return assert.returnType((this._strValue), $traceurRuntime.type.string);
            } else if (type == TOKEN_TYPE_NUMBER) {
              return assert.returnType((this._numValue.toString()), $traceurRuntime.type.string);
            } else {
              return assert.returnType((null), $traceurRuntime.type.string);
            }
          }
        }, {});
      }()));
      Object.defineProperty(Token, "parameters", {get: function() {
          return [[int], [int], [$traceurRuntime.type.number], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(Token.prototype.isCharacter, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(Token.prototype.isOperator, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(newCharacterToken, "parameters", {get: function() {
          return [[int], [int]];
        }});
      Object.defineProperty(newIdentifierToken, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(newKeywordToken, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(newOperatorToken, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(newStringToken, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(newNumberToken, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.number]];
        }});
      EOF = $__export("EOF", assert.type(new Token(-1, 0, 0, ""), Token));
      $EOF = $__export("$EOF", 0);
      $TAB = $__export("$TAB", 9);
      $LF = $__export("$LF", 10);
      $VTAB = $__export("$VTAB", 11);
      $FF = $__export("$FF", 12);
      $CR = $__export("$CR", 13);
      $SPACE = $__export("$SPACE", 32);
      $BANG = $__export("$BANG", 33);
      $DQ = $__export("$DQ", 34);
      $HASH = $__export("$HASH", 35);
      $$ = $__export("$$", 36);
      $PERCENT = $__export("$PERCENT", 37);
      $AMPERSAND = $__export("$AMPERSAND", 38);
      $SQ = $__export("$SQ", 39);
      $LPAREN = $__export("$LPAREN", 40);
      $RPAREN = $__export("$RPAREN", 41);
      $STAR = $__export("$STAR", 42);
      $PLUS = $__export("$PLUS", 43);
      $COMMA = $__export("$COMMA", 44);
      $MINUS = $__export("$MINUS", 45);
      $PERIOD = $__export("$PERIOD", 46);
      $SLASH = $__export("$SLASH", 47);
      $COLON = $__export("$COLON", 58);
      $SEMICOLON = $__export("$SEMICOLON", 59);
      $LT = $__export("$LT", 60);
      $EQ = $__export("$EQ", 61);
      $GT = $__export("$GT", 62);
      $QUESTION = $__export("$QUESTION", 63);
      $0 = 48;
      $9 = 57;
      $A = 65, $B = 66, $C = 67, $D = 68, $E = 69, $F = 70, $G = 71, $H = 72, $I = 73, $J = 74, $K = 75, $L = 76, $M = 77, $N = 78, $O = 79, $P = 80, $Q = 81, $R = 82, $S = 83, $T = 84, $U = 85, $V = 86, $W = 87, $X = 88, $Y = 89, $Z = 90;
      $LBRACKET = $__export("$LBRACKET", 91);
      $BACKSLASH = $__export("$BACKSLASH", 92);
      $RBRACKET = $__export("$RBRACKET", 93);
      $CARET = 94;
      $_ = 95;
      $a = 97, $b = 98, $c = 99, $d = 100, $e = 101, $f = 102, $g = 103, $h = 104, $i = 105, $j = 106, $k = 107, $l = 108, $m = 109, $n = 110, $o = 111, $p = 112, $q = 113, $r = 114, $s = 115, $t = 116, $u = 117, $v = 118, $w = 119, $x = 120, $y = 121, $z = 122;
      $LBRACE = $__export("$LBRACE", 123);
      $BAR = $__export("$BAR", 124);
      $RBRACE = $__export("$RBRACE", 125);
      $TILDE = 126;
      $NBSP = 160;
      ScannerError = $__export("ScannerError", (function($__super) {
        var ScannerError = function ScannerError(message) {
          this.message = message;
        };
        return ($traceurRuntime.createClass)(ScannerError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(Error)));
      _Scanner = (function() {
        var _Scanner = function _Scanner(input) {
          assert.argumentTypes(input, $traceurRuntime.type.string);
          this.input = input;
          this.length = input.length;
          this.peek = 0;
          this.index = -1;
          this.advance();
        };
        return ($traceurRuntime.createClass)(_Scanner, {
          advance: function() {
            this.peek = ++this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
          },
          scanToken: function() {
            var input = this.input,
                length = this.length,
                peek = this.peek,
                index = this.index;
            while (peek <= $SPACE) {
              if (++index >= length) {
                peek = $EOF;
                break;
              } else {
                peek = StringWrapper.charCodeAt(input, index);
              }
            }
            this.peek = peek;
            this.index = index;
            if (index >= length) {
              return assert.returnType((null), Token);
            }
            if (isIdentifierStart(peek))
              return assert.returnType((this.scanIdentifier()), Token);
            if (isDigit(peek))
              return assert.returnType((this.scanNumber(index)), Token);
            var start = assert.type(index, int);
            switch (peek) {
              case $PERIOD:
                this.advance();
                return assert.returnType((isDigit(this.peek) ? this.scanNumber(start) : newCharacterToken(start, $PERIOD)), Token);
              case $LPAREN:
              case $RPAREN:
              case $LBRACE:
              case $RBRACE:
              case $LBRACKET:
              case $RBRACKET:
              case $COMMA:
              case $COLON:
              case $SEMICOLON:
                return assert.returnType((this.scanCharacter(start, peek)), Token);
              case $SQ:
              case $DQ:
                return assert.returnType((this.scanString()), Token);
              case $HASH:
                return assert.returnType((this.scanOperator(start, StringWrapper.fromCharCode(peek))), Token);
              case $PLUS:
              case $MINUS:
              case $STAR:
              case $SLASH:
              case $PERCENT:
              case $CARET:
              case $QUESTION:
                return assert.returnType((this.scanOperator(start, StringWrapper.fromCharCode(peek))), Token);
              case $LT:
              case $GT:
              case $BANG:
              case $EQ:
                return assert.returnType((this.scanComplexOperator(start, $EQ, StringWrapper.fromCharCode(peek), '=')), Token);
              case $AMPERSAND:
                return assert.returnType((this.scanComplexOperator(start, $AMPERSAND, '&', '&')), Token);
              case $BAR:
                return assert.returnType((this.scanComplexOperator(start, $BAR, '|', '|')), Token);
              case $TILDE:
                return assert.returnType((this.scanComplexOperator(start, $SLASH, '~', '/')), Token);
              case $NBSP:
                while (isWhitespace(this.peek))
                  this.advance();
                return assert.returnType((this.scanToken()), Token);
            }
            this.error(("Unexpected character [" + StringWrapper.fromCharCode(peek) + "]"), 0);
            return assert.returnType((null), Token);
          },
          scanCharacter: function(start, code) {
            assert.argumentTypes(start, int, code, int);
            assert(this.peek == code);
            this.advance();
            return assert.returnType((newCharacterToken(start, code)), Token);
          },
          scanOperator: function(start, str) {
            assert.argumentTypes(start, int, str, $traceurRuntime.type.string);
            assert(this.peek == StringWrapper.charCodeAt(str, 0));
            assert(SetWrapper.has(OPERATORS, str));
            this.advance();
            return assert.returnType((newOperatorToken(start, str)), Token);
          },
          scanComplexOperator: function(start, code, one, two) {
            assert.argumentTypes(start, int, code, int, one, $traceurRuntime.type.string, two, $traceurRuntime.type.string);
            assert(this.peek == StringWrapper.charCodeAt(one, 0));
            this.advance();
            var str = assert.type(one, $traceurRuntime.type.string);
            if (this.peek == code) {
              this.advance();
              str += two;
            }
            assert(SetWrapper.has(OPERATORS, str));
            return assert.returnType((newOperatorToken(start, str)), Token);
          },
          scanIdentifier: function() {
            assert(isIdentifierStart(this.peek));
            var start = assert.type(this.index, int);
            this.advance();
            while (isIdentifierPart(this.peek))
              this.advance();
            var str = assert.type(this.input.substring(start, this.index), $traceurRuntime.type.string);
            if (SetWrapper.has(KEYWORDS, str)) {
              return assert.returnType((newKeywordToken(start, str)), Token);
            } else {
              return assert.returnType((newIdentifierToken(start, str)), Token);
            }
          },
          scanNumber: function(start) {
            assert.argumentTypes(start, int);
            assert(isDigit(this.peek));
            var simple = assert.type((this.index === start), $traceurRuntime.type.boolean);
            this.advance();
            while (true) {
              if (isDigit(this.peek)) {} else if (this.peek == $PERIOD) {
                simple = false;
              } else if (isExponentStart(this.peek)) {
                this.advance();
                if (isExponentSign(this.peek))
                  this.advance();
                if (!isDigit(this.peek))
                  this.error('Invalid exponent', -1);
                simple = false;
              } else {
                break;
              }
              this.advance();
            }
            var str = assert.type(this.input.substring(start, this.index), $traceurRuntime.type.string);
            var value = assert.type(simple ? NumberWrapper.parseIntAutoRadix(str) : NumberWrapper.parseFloat(str), $traceurRuntime.type.number);
            return assert.returnType((newNumberToken(start, value)), Token);
          },
          scanString: function() {
            assert(this.peek == $SQ || this.peek == $DQ);
            var start = assert.type(this.index, int);
            var quote = assert.type(this.peek, int);
            this.advance();
            var buffer;
            var marker = assert.type(this.index, int);
            var input = assert.type(this.input, $traceurRuntime.type.string);
            while (this.peek != quote) {
              if (this.peek == $BACKSLASH) {
                if (buffer == null)
                  buffer = new StringJoiner();
                buffer.add(input.substring(marker, this.index));
                this.advance();
                var unescapedCode = void 0;
                if (this.peek == $u) {
                  var hex = assert.type(input.substring(this.index + 1, this.index + 5), $traceurRuntime.type.string);
                  try {
                    unescapedCode = NumberWrapper.parseInt(hex, 16);
                  } catch (e) {
                    this.error(("Invalid unicode escape [\\u" + hex + "]"), 0);
                  }
                  for (var i = assert.type(0, int); i < 5; i++) {
                    this.advance();
                  }
                } else {
                  unescapedCode = unescape(this.peek);
                  this.advance();
                }
                buffer.add(StringWrapper.fromCharCode(unescapedCode));
                marker = this.index;
              } else if (this.peek == $EOF) {
                this.error('Unterminated quote', 0);
              } else {
                this.advance();
              }
            }
            var last = assert.type(input.substring(marker, this.index), $traceurRuntime.type.string);
            this.advance();
            var unescaped = assert.type(last, $traceurRuntime.type.string);
            if (buffer != null) {
              buffer.add(last);
              unescaped = buffer.toString();
            }
            return assert.returnType((newStringToken(start, unescaped)), Token);
          },
          error: function(message, offset) {
            assert.argumentTypes(message, $traceurRuntime.type.string, offset, int);
            var position = assert.type(this.index + offset, int);
            throw new ScannerError(("Lexer Error: " + message + " at column " + position + " in expression [" + this.input + "]"));
          }
        }, {});
      }());
      Object.defineProperty(_Scanner, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_Scanner.prototype.scanCharacter, "parameters", {get: function() {
          return [[int], [int]];
        }});
      Object.defineProperty(_Scanner.prototype.scanOperator, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_Scanner.prototype.scanComplexOperator, "parameters", {get: function() {
          return [[int], [int], [$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_Scanner.prototype.scanNumber, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(_Scanner.prototype.error, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [int]];
        }});
      Object.defineProperty(isWhitespace, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(isIdentifierStart, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(isIdentifierPart, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(isDigit, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(isExponentStart, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(isExponentSign, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(unescape, "parameters", {get: function() {
          return [[int]];
        }});
      OPERATORS = SetWrapper.createFromList(['+', '-', '*', '/', '~/', '%', '^', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '&', '|', '!', '?', '#']);
      KEYWORDS = SetWrapper.createFromList(['null', 'undefined', 'true', 'false']);
    }
  };
});




System.register("change_detection/parser/parser", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "./lexer", "reflection/reflection", "./ast"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/parser";
  var assert,
      FIELD,
      int,
      isBlank,
      isPresent,
      BaseException,
      StringWrapper,
      RegExpWrapper,
      ListWrapper,
      List,
      Lexer,
      EOF,
      Token,
      $PERIOD,
      $COLON,
      $SEMICOLON,
      $LBRACKET,
      $RBRACKET,
      $COMMA,
      $LBRACE,
      $RBRACE,
      $LPAREN,
      $RPAREN,
      reflector,
      Reflector,
      AST,
      EmptyExpr,
      ImplicitReceiver,
      AccessMember,
      LiteralPrimitive,
      Expression,
      Binary,
      PrefixNot,
      Conditional,
      Formatter,
      Assignment,
      Chain,
      KeyedAccess,
      LiteralArray,
      LiteralMap,
      Interpolation,
      MethodCall,
      FunctionCall,
      TemplateBindings,
      TemplateBinding,
      ASTWithSource,
      _implicitReceiver,
      INTERPOLATION_REGEXP,
      QUOTE_REGEXP,
      Parser,
      _ParseAST;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      FIELD = m.FIELD;
      int = m.int;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      BaseException = m.BaseException;
      StringWrapper = m.StringWrapper;
      RegExpWrapper = m.RegExpWrapper;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      List = m.List;
    }, function(m) {
      Lexer = m.Lexer;
      EOF = m.EOF;
      Token = m.Token;
      $PERIOD = m.$PERIOD;
      $COLON = m.$COLON;
      $SEMICOLON = m.$SEMICOLON;
      $LBRACKET = m.$LBRACKET;
      $RBRACKET = m.$RBRACKET;
      $COMMA = m.$COMMA;
      $LBRACE = m.$LBRACE;
      $RBRACE = m.$RBRACE;
      $LPAREN = m.$LPAREN;
      $RPAREN = m.$RPAREN;
    }, function(m) {
      reflector = m.reflector;
      Reflector = m.Reflector;
    }, function(m) {
      AST = m.AST;
      EmptyExpr = m.EmptyExpr;
      ImplicitReceiver = m.ImplicitReceiver;
      AccessMember = m.AccessMember;
      LiteralPrimitive = m.LiteralPrimitive;
      Expression = m.Expression;
      Binary = m.Binary;
      PrefixNot = m.PrefixNot;
      Conditional = m.Conditional;
      Formatter = m.Formatter;
      Assignment = m.Assignment;
      Chain = m.Chain;
      KeyedAccess = m.KeyedAccess;
      LiteralArray = m.LiteralArray;
      LiteralMap = m.LiteralMap;
      Interpolation = m.Interpolation;
      MethodCall = m.MethodCall;
      FunctionCall = m.FunctionCall;
      TemplateBindings = m.TemplateBindings;
      TemplateBinding = m.TemplateBinding;
      ASTWithSource = m.ASTWithSource;
    }],
    execute: function() {
      _implicitReceiver = new ImplicitReceiver();
      INTERPOLATION_REGEXP = RegExpWrapper.create('\\{\\{(.*?)\\}\\}');
      QUOTE_REGEXP = RegExpWrapper.create("'");
      Parser = $__export("Parser", (function() {
        var Parser = function Parser(lexer) {
          var providedReflector = arguments[1] !== (void 0) ? arguments[1] : null;
          assert.argumentTypes(lexer, Lexer, providedReflector, Reflector);
          this._lexer = lexer;
          this._reflector = isPresent(providedReflector) ? providedReflector : reflector;
        };
        return ($traceurRuntime.createClass)(Parser, {
          parseAction: function(input, location) {
            assert.argumentTypes(input, $traceurRuntime.type.string, location, $traceurRuntime.type.any);
            var tokens = this._lexer.tokenize(input);
            var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
            return assert.returnType((new ASTWithSource(ast, input, location)), ASTWithSource);
          },
          parseBinding: function(input, location) {
            assert.argumentTypes(input, $traceurRuntime.type.string, location, $traceurRuntime.type.any);
            var tokens = this._lexer.tokenize(input);
            var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
            return assert.returnType((new ASTWithSource(ast, input, location)), ASTWithSource);
          },
          parseTemplateBindings: function(input, location) {
            assert.argumentTypes(input, $traceurRuntime.type.string, location, $traceurRuntime.type.any);
            var tokens = this._lexer.tokenize(input);
            return assert.returnType((new _ParseAST(input, location, tokens, this._reflector, false).parseTemplateBindings()), List);
          },
          parseInterpolation: function(input, location) {
            assert.argumentTypes(input, $traceurRuntime.type.string, location, $traceurRuntime.type.any);
            var parts = StringWrapper.split(input, INTERPOLATION_REGEXP);
            if (parts.length <= 1) {
              return assert.returnType((null), ASTWithSource);
            }
            var strings = [];
            var expressions = [];
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];
              if (i % 2 === 0) {
                ListWrapper.push(strings, part);
              } else {
                var tokens = this._lexer.tokenize(part);
                var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
                ListWrapper.push(expressions, ast);
              }
            }
            return assert.returnType((new ASTWithSource(new Interpolation(strings, expressions), input, location)), ASTWithSource);
          }
        }, {});
      }()));
      Object.defineProperty(Parser, "parameters", {get: function() {
          return [[Lexer], [Reflector]];
        }});
      Object.defineProperty(Parser.prototype.parseAction, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(Parser.prototype.parseBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(Parser.prototype.parseTemplateBindings, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(Parser.prototype.parseInterpolation, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.any]];
        }});
      _ParseAST = (function() {
        var _ParseAST = function _ParseAST(input, location, tokens, reflector, parseAction) {
          assert.argumentTypes(input, $traceurRuntime.type.string, location, $traceurRuntime.type.any, tokens, List, reflector, Reflector, parseAction, $traceurRuntime.type.boolean);
          this.input = input;
          this.location = location;
          this.tokens = tokens;
          this.index = 0;
          this.reflector = reflector;
          this.parseAction = parseAction;
        };
        return ($traceurRuntime.createClass)(_ParseAST, {
          peek: function(offset) {
            assert.argumentTypes(offset, int);
            var i = this.index + offset;
            return assert.returnType((i < this.tokens.length ? this.tokens[i] : EOF), Token);
          },
          get next() {
            return assert.returnType((this.peek(0)), Token);
          },
          get inputIndex() {
            return assert.returnType(((this.index < this.tokens.length) ? this.next.index : this.input.length), int);
          },
          advance: function() {
            this.index++;
          },
          optionalCharacter: function(code) {
            assert.argumentTypes(code, int);
            if (this.next.isCharacter(code)) {
              this.advance();
              return assert.returnType((true), $traceurRuntime.type.boolean);
            } else {
              return assert.returnType((false), $traceurRuntime.type.boolean);
            }
          },
          expectCharacter: function(code) {
            assert.argumentTypes(code, int);
            if (this.optionalCharacter(code))
              return ;
            this.error(("Missing expected " + StringWrapper.fromCharCode(code)));
          },
          optionalOperator: function(op) {
            assert.argumentTypes(op, $traceurRuntime.type.string);
            if (this.next.isOperator(op)) {
              this.advance();
              return assert.returnType((true), $traceurRuntime.type.boolean);
            } else {
              return assert.returnType((false), $traceurRuntime.type.boolean);
            }
          },
          expectOperator: function(operator) {
            assert.argumentTypes(operator, $traceurRuntime.type.string);
            if (this.optionalOperator(operator))
              return ;
            this.error(("Missing expected operator " + operator));
          },
          expectIdentifierOrKeyword: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword()) {
              this.error(("Unexpected token " + n + ", expected identifier or keyword"));
            }
            this.advance();
            return assert.returnType((n.toString()), $traceurRuntime.type.string);
          },
          expectIdentifierOrKeywordOrString: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
              this.error(("Unexpected token " + n + ", expected identifier, keyword, or string"));
            }
            this.advance();
            return assert.returnType((n.toString()), $traceurRuntime.type.string);
          },
          parseChain: function() {
            var exprs = [];
            while (this.index < this.tokens.length) {
              var expr = this.parseFormatter();
              ListWrapper.push(exprs, expr);
              if (this.optionalCharacter($SEMICOLON)) {
                if (!this.parseAction) {
                  this.error("Binding expression cannot contain chained expression");
                }
                while (this.optionalCharacter($SEMICOLON)) {}
              } else if (this.index < this.tokens.length) {
                this.error(("Unexpected token '" + this.next + "'"));
              }
            }
            if (exprs.length == 0)
              return assert.returnType((new EmptyExpr()), AST);
            if (exprs.length == 1)
              return assert.returnType((exprs[0]), AST);
            return assert.returnType((new Chain(exprs)), AST);
          },
          parseFormatter: function() {
            var result = this.parseExpression();
            while (this.optionalOperator("|")) {
              if (this.parseAction) {
                this.error("Cannot have a formatter in an action expression");
              }
              var name = this.expectIdentifierOrKeyword();
              var args = ListWrapper.create();
              while (this.optionalCharacter($COLON)) {
                ListWrapper.push(args, this.parseExpression());
              }
              result = new Formatter(result, name, args);
            }
            return result;
          },
          parseExpression: function() {
            var start = this.inputIndex;
            var result = this.parseConditional();
            while (this.next.isOperator('=')) {
              if (!result.isAssignable) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error(("Expression " + expression + " is not assignable"));
              }
              if (!this.parseAction) {
                this.error("Binding expression cannot contain assignments");
              }
              this.expectOperator('=');
              result = new Assignment(result, this.parseConditional());
            }
            return result;
          },
          parseConditional: function() {
            var start = this.inputIndex;
            var result = this.parseLogicalOr();
            if (this.optionalOperator('?')) {
              var yes = this.parseExpression();
              if (!this.optionalCharacter($COLON)) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error(("Conditional expression " + expression + " requires all 3 expressions"));
              }
              var no = this.parseExpression();
              return new Conditional(result, yes, no);
            } else {
              return result;
            }
          },
          parseLogicalOr: function() {
            var result = this.parseLogicalAnd();
            while (this.optionalOperator('||')) {
              result = new Binary('||', result, this.parseLogicalAnd());
            }
            return result;
          },
          parseLogicalAnd: function() {
            var result = this.parseEquality();
            while (this.optionalOperator('&&')) {
              result = new Binary('&&', result, this.parseEquality());
            }
            return result;
          },
          parseEquality: function() {
            var result = this.parseRelational();
            while (true) {
              if (this.optionalOperator('==')) {
                result = new Binary('==', result, this.parseRelational());
              } else if (this.optionalOperator('!=')) {
                result = new Binary('!=', result, this.parseRelational());
              } else {
                return result;
              }
            }
          },
          parseRelational: function() {
            var result = this.parseAdditive();
            while (true) {
              if (this.optionalOperator('<')) {
                result = new Binary('<', result, this.parseAdditive());
              } else if (this.optionalOperator('>')) {
                result = new Binary('>', result, this.parseAdditive());
              } else if (this.optionalOperator('<=')) {
                result = new Binary('<=', result, this.parseAdditive());
              } else if (this.optionalOperator('>=')) {
                result = new Binary('>=', result, this.parseAdditive());
              } else {
                return result;
              }
            }
          },
          parseAdditive: function() {
            var result = this.parseMultiplicative();
            while (true) {
              if (this.optionalOperator('+')) {
                result = new Binary('+', result, this.parseMultiplicative());
              } else if (this.optionalOperator('-')) {
                result = new Binary('-', result, this.parseMultiplicative());
              } else {
                return result;
              }
            }
          },
          parseMultiplicative: function() {
            var result = this.parsePrefix();
            while (true) {
              if (this.optionalOperator('*')) {
                result = new Binary('*', result, this.parsePrefix());
              } else if (this.optionalOperator('%')) {
                result = new Binary('%', result, this.parsePrefix());
              } else if (this.optionalOperator('/')) {
                result = new Binary('/', result, this.parsePrefix());
              } else {
                return result;
              }
            }
          },
          parsePrefix: function() {
            if (this.optionalOperator('+')) {
              return this.parsePrefix();
            } else if (this.optionalOperator('-')) {
              return new Binary('-', new LiteralPrimitive(0), this.parsePrefix());
            } else if (this.optionalOperator('!')) {
              return new PrefixNot(this.parsePrefix());
            } else {
              return this.parseCallChain();
            }
          },
          parseCallChain: function() {
            var result = this.parsePrimary();
            while (true) {
              if (this.optionalCharacter($PERIOD)) {
                result = this.parseAccessMemberOrMethodCall(result);
              } else if (this.optionalCharacter($LBRACKET)) {
                var key = this.parseExpression();
                this.expectCharacter($RBRACKET);
                result = new KeyedAccess(result, key);
              } else if (this.optionalCharacter($LPAREN)) {
                var args = this.parseCallArguments();
                this.expectCharacter($RPAREN);
                result = new FunctionCall(result, args);
              } else {
                return assert.returnType((result), AST);
              }
            }
          },
          parsePrimary: function() {
            if (this.optionalCharacter($LPAREN)) {
              var result = this.parseFormatter();
              this.expectCharacter($RPAREN);
              return result;
            } else if (this.next.isKeywordNull() || this.next.isKeywordUndefined()) {
              this.advance();
              return new LiteralPrimitive(null);
            } else if (this.next.isKeywordTrue()) {
              this.advance();
              return new LiteralPrimitive(true);
            } else if (this.next.isKeywordFalse()) {
              this.advance();
              return new LiteralPrimitive(false);
            } else if (this.optionalCharacter($LBRACKET)) {
              var elements = this.parseExpressionList($RBRACKET);
              this.expectCharacter($RBRACKET);
              return new LiteralArray(elements);
            } else if (this.next.isCharacter($LBRACE)) {
              return this.parseLiteralMap();
            } else if (this.next.isIdentifier()) {
              return this.parseAccessMemberOrMethodCall(_implicitReceiver);
            } else if (this.next.isNumber()) {
              var value = this.next.toNumber();
              this.advance();
              return new LiteralPrimitive(value);
            } else if (this.next.isString()) {
              var value = this.next.toString();
              this.advance();
              return new LiteralPrimitive(value);
            } else if (this.index >= this.tokens.length) {
              this.error(("Unexpected end of expression: " + this.input));
            } else {
              this.error(("Unexpected token " + this.next));
            }
          },
          parseExpressionList: function(terminator) {
            assert.argumentTypes(terminator, int);
            var result = [];
            if (!this.next.isCharacter(terminator)) {
              do {
                ListWrapper.push(result, this.parseExpression());
              } while (this.optionalCharacter($COMMA));
            }
            return assert.returnType((result), List);
          },
          parseLiteralMap: function() {
            var keys = [];
            var values = [];
            this.expectCharacter($LBRACE);
            if (!this.optionalCharacter($RBRACE)) {
              do {
                var key = this.expectIdentifierOrKeywordOrString();
                ListWrapper.push(keys, key);
                this.expectCharacter($COLON);
                ListWrapper.push(values, this.parseExpression());
              } while (this.optionalCharacter($COMMA));
              this.expectCharacter($RBRACE);
            }
            return new LiteralMap(keys, values);
          },
          parseAccessMemberOrMethodCall: function(receiver) {
            var id = this.expectIdentifierOrKeyword();
            if (this.optionalCharacter($LPAREN)) {
              var args = this.parseCallArguments();
              this.expectCharacter($RPAREN);
              var fn = this.reflector.method(id);
              return assert.returnType((new MethodCall(receiver, id, fn, args)), AST);
            } else {
              var getter = this.reflector.getter(id);
              var setter = this.reflector.setter(id);
              return assert.returnType((new AccessMember(receiver, id, getter, setter)), AST);
            }
          },
          parseCallArguments: function() {
            if (this.next.isCharacter($RPAREN))
              return [];
            var positionals = [];
            do {
              ListWrapper.push(positionals, this.parseExpression());
            } while (this.optionalCharacter($COMMA));
            return positionals;
          },
          expectTemplateBindingKey: function() {
            var result = '';
            var operatorFound = false;
            do {
              result += this.expectIdentifierOrKeywordOrString();
              operatorFound = this.optionalOperator('-');
              if (operatorFound) {
                result += '-';
              }
            } while (operatorFound);
            return result.toString();
          },
          parseTemplateBindings: function() {
            var bindings = [];
            while (this.index < this.tokens.length) {
              var key = this.expectTemplateBindingKey();
              this.optionalCharacter($COLON);
              var name = null;
              var expression = null;
              if (this.next !== EOF) {
                if (this.optionalOperator("#")) {
                  name = this.expectIdentifierOrKeyword();
                } else {
                  var start = this.inputIndex;
                  var ast = this.parseExpression();
                  var source = this.input.substring(start, this.inputIndex);
                  expression = new ASTWithSource(ast, source, this.location);
                }
              }
              ListWrapper.push(bindings, new TemplateBinding(key, name, expression));
              if (!this.optionalCharacter($SEMICOLON)) {
                this.optionalCharacter($COMMA);
              }
              ;
            }
            return bindings;
          },
          error: function(message) {
            var index = arguments[1] !== (void 0) ? arguments[1] : null;
            assert.argumentTypes(message, $traceurRuntime.type.string, index, int);
            if (isBlank(index))
              index = this.index;
            var location = (index < this.tokens.length) ? ("at column " + (this.tokens[index].index + 1) + " in") : "at the end of the expression";
            throw new BaseException(("Parser Error: " + message + " " + location + " [" + this.input + "] in " + this.location));
          }
        }, {});
      }());
      Object.defineProperty(_ParseAST, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.any], [List], [Reflector], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(_ParseAST.prototype.peek, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(_ParseAST.prototype.optionalCharacter, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(_ParseAST.prototype.expectCharacter, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(_ParseAST.prototype.optionalOperator, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_ParseAST.prototype.expectOperator, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_ParseAST.prototype.parseExpressionList, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(_ParseAST.prototype.error, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [int]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/compile_control", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "facade/dom", "./compile_element", "./compile_step"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_control";
  var assert,
      isBlank,
      List,
      ListWrapper,
      DOM,
      Element,
      CompileElement,
      CompileStep,
      CompileControl;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isBlank = m.isBlank;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      DOM = m.DOM;
      Element = m.Element;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileStep = m.CompileStep;
    }],
    execute: function() {
      CompileControl = $__export("CompileControl", (function() {
        var CompileControl = function CompileControl(steps) {
          this._steps = steps;
          this._currentStepIndex = 0;
          this._parent = null;
          this._current = null;
          this._results = null;
          this._additionalChildren = null;
        };
        return ($traceurRuntime.createClass)(CompileControl, {
          internalProcess: function(results, startStepIndex, parent, current) {
            assert.argumentTypes(results, $traceurRuntime.type.any, startStepIndex, $traceurRuntime.type.any, parent, CompileElement, current, CompileElement);
            this._results = results;
            var previousStepIndex = this._currentStepIndex;
            var previousParent = this._parent;
            for (var i = startStepIndex; i < this._steps.length; i++) {
              var step = this._steps[i];
              this._parent = parent;
              this._current = current;
              this._currentStepIndex = i;
              step.process(parent, current, this);
              parent = this._parent;
            }
            ListWrapper.push(results, current);
            this._currentStepIndex = previousStepIndex;
            this._parent = previousParent;
            var localAdditionalChildren = this._additionalChildren;
            this._additionalChildren = null;
            return localAdditionalChildren;
          },
          addParent: function(newElement) {
            assert.argumentTypes(newElement, CompileElement);
            this.internalProcess(this._results, this._currentStepIndex + 1, this._parent, newElement);
            this._parent = newElement;
          },
          addChild: function(element) {
            assert.argumentTypes(element, CompileElement);
            if (isBlank(this._additionalChildren)) {
              this._additionalChildren = ListWrapper.create();
            }
            ListWrapper.push(this._additionalChildren, element);
          }
        }, {});
      }()));
      Object.defineProperty(CompileControl.prototype.internalProcess, "parameters", {get: function() {
          return [[], [], [CompileElement], [CompileElement]];
        }});
      Object.defineProperty(CompileControl.prototype.addParent, "parameters", {get: function() {
          return [[CompileElement]];
        }});
      Object.defineProperty(CompileControl.prototype.addChild, "parameters", {get: function() {
          return [[CompileElement]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/compile_element", ["rtts_assert/rtts_assert", "facade/collection", "facade/dom", "facade/lang", "../directive_metadata", "../../annotations/annotations", "../element_binder", "../element_injector", "../view", "change_detection/change_detection"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_element";
  var assert,
      List,
      Map,
      ListWrapper,
      MapWrapper,
      Element,
      DOM,
      int,
      isBlank,
      isPresent,
      Type,
      DirectiveMetadata,
      Decorator,
      Component,
      Template,
      ElementBinder,
      ProtoElementInjector,
      ProtoView,
      AST,
      CompileElement;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      List = m.List;
      Map = m.Map;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      Element = m.Element;
      DOM = m.DOM;
    }, function(m) {
      int = m.int;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      Type = m.Type;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      Decorator = m.Decorator;
      Component = m.Component;
      Template = m.Template;
    }, function(m) {
      ElementBinder = m.ElementBinder;
    }, function(m) {
      ProtoElementInjector = m.ProtoElementInjector;
    }, function(m) {
      ProtoView = m.ProtoView;
    }, function(m) {
      AST = m.AST;
    }],
    execute: function() {
      CompileElement = $__export("CompileElement", (function() {
        var CompileElement = function CompileElement(element) {
          assert.argumentTypes(element, Element);
          this.element = element;
          this._attrs = null;
          this._classList = null;
          this.textNodeBindings = null;
          this.propertyBindings = null;
          this.eventBindings = null;
          this.variableBindings = null;
          this.decoratorDirectives = null;
          this.templateDirective = null;
          this.componentDirective = null;
          this._allDirectives = null;
          this.isViewRoot = false;
          this.hasBindings = false;
          this.inheritedProtoView = null;
          this.inheritedProtoElementInjector = null;
          this.inheritedElementBinder = null;
          this.distanceToParentInjector = 0;
          this.compileChildren = true;
        };
        return ($traceurRuntime.createClass)(CompileElement, {
          refreshAttrs: function() {
            this._attrs = null;
          },
          attrs: function() {
            if (isBlank(this._attrs)) {
              this._attrs = DOM.attributeMap(this.element);
            }
            return assert.returnType((this._attrs), Map);
          },
          refreshClassList: function() {
            this._classList = null;
          },
          classList: function() {
            if (isBlank(this._classList)) {
              this._classList = ListWrapper.create();
              var elClassList = DOM.classList(this.element);
              for (var i = 0; i < elClassList.length; i++) {
                ListWrapper.push(this._classList, elClassList[i]);
              }
            }
            return assert.returnType((this._classList), List);
          },
          addTextNodeBinding: function(indexInParent, expression) {
            assert.argumentTypes(indexInParent, int, expression, AST);
            if (isBlank(this.textNodeBindings)) {
              this.textNodeBindings = MapWrapper.create();
            }
            MapWrapper.set(this.textNodeBindings, indexInParent, expression);
          },
          addPropertyBinding: function(property, expression) {
            assert.argumentTypes(property, $traceurRuntime.type.string, expression, AST);
            if (isBlank(this.propertyBindings)) {
              this.propertyBindings = MapWrapper.create();
            }
            MapWrapper.set(this.propertyBindings, property, expression);
          },
          addVariableBinding: function(contextName, templateName) {
            assert.argumentTypes(contextName, $traceurRuntime.type.string, templateName, $traceurRuntime.type.string);
            if (isBlank(this.variableBindings)) {
              this.variableBindings = MapWrapper.create();
            }
            MapWrapper.set(this.variableBindings, contextName, templateName);
          },
          addEventBinding: function(eventName, expression) {
            assert.argumentTypes(eventName, $traceurRuntime.type.string, expression, AST);
            if (isBlank(this.eventBindings)) {
              this.eventBindings = MapWrapper.create();
            }
            MapWrapper.set(this.eventBindings, eventName, expression);
          },
          addDirective: function(directive) {
            assert.argumentTypes(directive, DirectiveMetadata);
            var annotation = directive.annotation;
            this._allDirectives = null;
            if (annotation instanceof Decorator) {
              if (isBlank(this.decoratorDirectives)) {
                this.decoratorDirectives = ListWrapper.create();
              }
              ListWrapper.push(this.decoratorDirectives, directive);
              if (!annotation.compileChildren) {
                this.compileChildren = false;
              }
            } else if (annotation instanceof Template) {
              this.templateDirective = directive;
            } else if (annotation instanceof Component) {
              this.componentDirective = directive;
            }
          },
          getAllDirectives: function() {
            if (this._allDirectives === null) {
              var directives = ListWrapper.create();
              if (isPresent(this.componentDirective)) {
                ListWrapper.push(directives, this.componentDirective);
              }
              if (isPresent(this.templateDirective)) {
                ListWrapper.push(directives, this.templateDirective);
              }
              if (isPresent(this.decoratorDirectives)) {
                directives = ListWrapper.concat(directives, this.decoratorDirectives);
              }
              this._allDirectives = directives;
            }
            return assert.returnType((this._allDirectives), List);
          }
        }, {});
      }()));
      Object.defineProperty(CompileElement, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(CompileElement.prototype.addTextNodeBinding, "parameters", {get: function() {
          return [[int], [AST]];
        }});
      Object.defineProperty(CompileElement.prototype.addPropertyBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [AST]];
        }});
      Object.defineProperty(CompileElement.prototype.addVariableBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(CompileElement.prototype.addEventBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [AST]];
        }});
      Object.defineProperty(CompileElement.prototype.addDirective, "parameters", {get: function() {
          return [[DirectiveMetadata]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/compile_pipeline", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "facade/dom", "./compile_element", "./compile_control", "./compile_step", "../directive_metadata"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_pipeline";
  var assert,
      isPresent,
      List,
      ListWrapper,
      Element,
      Node,
      DOM,
      CompileElement,
      CompileControl,
      CompileStep,
      DirectiveMetadata,
      CompilePipeline;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      Element = m.Element;
      Node = m.Node;
      DOM = m.DOM;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }],
    execute: function() {
      CompilePipeline = $__export("CompilePipeline", (function() {
        var CompilePipeline = function CompilePipeline(steps) {
          assert.argumentTypes(steps, List);
          this._control = new CompileControl(steps);
        };
        return ($traceurRuntime.createClass)(CompilePipeline, {
          process: function(rootElement) {
            assert.argumentTypes(rootElement, Element);
            var results = ListWrapper.create();
            this._process(results, null, new CompileElement(rootElement));
            return assert.returnType((results), List);
          },
          _process: function(results, parent, current) {
            assert.argumentTypes(results, $traceurRuntime.type.any, parent, CompileElement, current, CompileElement);
            var additionalChildren = this._control.internalProcess(results, 0, parent, current);
            if (current.compileChildren) {
              var node = DOM.templateAwareRoot(current.element).firstChild;
              while (isPresent(node)) {
                var nextNode = DOM.nextSibling(node);
                if (node.nodeType === Node.ELEMENT_NODE) {
                  this._process(results, current, new CompileElement(node));
                }
                node = nextNode;
              }
            }
            if (isPresent(additionalChildren)) {
              for (var i = 0; i < additionalChildren.length; i++) {
                this._process(results, current, additionalChildren[i]);
              }
            }
          }
        }, {});
      }()));
      Object.defineProperty(CompilePipeline, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(CompilePipeline.prototype.process, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(CompilePipeline.prototype._process, "parameters", {get: function() {
          return [[], [CompileElement], [CompileElement]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/compile_step", ["rtts_assert/rtts_assert", "./compile_element", "./compile_control", "../directive_metadata"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_step";
  var assert,
      CompileElement,
      CompileControl,
      DirectiveMetadata,
      CompileStep;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }],
    execute: function() {
      CompileStep = $__export("CompileStep", (function() {
        var CompileStep = function CompileStep() {};
        return ($traceurRuntime.createClass)(CompileStep, {process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
          }}, {});
      }()));
      Object.defineProperty(CompileStep.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/default_steps", ["rtts_assert/rtts_assert", "change_detection/change_detection", "facade/collection", "./property_binding_parser", "./text_interpolation_parser", "./directive_parser", "./view_splitter", "./element_binding_marker", "./proto_view_builder", "./proto_element_injector_builder", "./element_binder_builder", "core/compiler/directive_metadata", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/default_steps";
  var assert,
      Parser,
      List,
      PropertyBindingParser,
      TextInterpolationParser,
      DirectiveParser,
      ViewSplitter,
      ElementBindingMarker,
      ProtoViewBuilder,
      ProtoElementInjectorBuilder,
      ElementBinderBuilder,
      DirectiveMetadata,
      stringify;
  function createDefaultSteps(parser, compiledComponent, directives) {
    assert.argumentTypes(parser, Parser, compiledComponent, DirectiveMetadata, directives, List);
    var compilationUnit = stringify(compiledComponent.type);
    return [new ViewSplitter(parser, compilationUnit), new PropertyBindingParser(parser, compilationUnit), new DirectiveParser(directives), new TextInterpolationParser(parser, compilationUnit), new ElementBindingMarker(), new ProtoViewBuilder(), new ProtoElementInjectorBuilder(), new ElementBinderBuilder()];
  }
  $__export("createDefaultSteps", createDefaultSteps);
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Parser = m.Parser;
    }, function(m) {
      List = m.List;
    }, function(m) {
      PropertyBindingParser = m.PropertyBindingParser;
    }, function(m) {
      TextInterpolationParser = m.TextInterpolationParser;
    }, function(m) {
      DirectiveParser = m.DirectiveParser;
    }, function(m) {
      ViewSplitter = m.ViewSplitter;
    }, function(m) {
      ElementBindingMarker = m.ElementBindingMarker;
    }, function(m) {
      ProtoViewBuilder = m.ProtoViewBuilder;
    }, function(m) {
      ProtoElementInjectorBuilder = m.ProtoElementInjectorBuilder;
    }, function(m) {
      ElementBinderBuilder = m.ElementBinderBuilder;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      stringify = m.stringify;
    }],
    execute: function() {
      Object.defineProperty(createDefaultSteps, "parameters", {get: function() {
          return [[Parser], [DirectiveMetadata], [List]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/directive_parser", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "facade/dom", "../selector", "../directive_metadata", "../../annotations/annotations", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/directive_parser";
  var assert,
      isPresent,
      BaseException,
      List,
      MapWrapper,
      TemplateElement,
      SelectorMatcher,
      CssSelector,
      DirectiveMetadata,
      Template,
      Component,
      CompileStep,
      CompileElement,
      CompileControl,
      DirectiveParser;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
      BaseException = m.BaseException;
    }, function(m) {
      List = m.List;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      TemplateElement = m.TemplateElement;
    }, function(m) {
      SelectorMatcher = m.SelectorMatcher;
      CssSelector = m.CssSelector;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      Template = m.Template;
      Component = m.Component;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      DirectiveParser = $__export("DirectiveParser", (function($__super) {
        var DirectiveParser = function DirectiveParser(directives) {
          assert.argumentTypes(directives, List);
          this._selectorMatcher = new SelectorMatcher();
          for (var i = 0; i < directives.length; i++) {
            var directiveMetadata = directives[i];
            this._selectorMatcher.addSelectable(CssSelector.parse(directiveMetadata.annotation.selector), directiveMetadata);
          }
        };
        return ($traceurRuntime.createClass)(DirectiveParser, {process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            var attrs = current.attrs();
            var classList = current.classList();
            var cssSelector = new CssSelector();
            cssSelector.setElement(current.element.nodeName);
            for (var i = 0; i < classList.length; i++) {
              cssSelector.addClassName(classList[i]);
            }
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              cssSelector.addAttribute(attrName, attrValue);
            }));
            if (isPresent(current.propertyBindings)) {
              MapWrapper.forEach(current.propertyBindings, (function(expression, prop) {
                cssSelector.addAttribute(prop, expression.source);
              }));
            }
            if (isPresent(current.variableBindings)) {
              MapWrapper.forEach(current.variableBindings, (function(value, name) {
                cssSelector.addAttribute(name, value);
              }));
            }
            var isTemplateElement = current.element instanceof TemplateElement;
            this._selectorMatcher.match(cssSelector, (function(directive) {
              if (directive.annotation instanceof Template) {
                if (!isTemplateElement) {
                  throw new BaseException('Template directives need to be placed on <template> elements or elements with template attribute!');
                } else if (isPresent(current.templateDirective)) {
                  throw new BaseException('Only one template directive per element is allowed!');
                }
              } else if (isTemplateElement) {
                throw new BaseException('Only template directives are allowed on <template> elements!');
              } else if ((directive.annotation instanceof Component) && isPresent(current.componentDirective)) {
                throw new BaseException('Only one component directive per element is allowed!');
              }
              current.addDirective(directive);
            }));
          }}, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(DirectiveParser, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(DirectiveParser.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/element_binder_builder", ["rtts_assert/rtts_assert", "facade/lang", "facade/dom", "facade/collection", "reflection/reflection", "change_detection/change_detection", "../../annotations/annotations", "../directive_metadata", "../view", "../element_injector", "../element_binder", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/element_binder_builder";
  var assert,
      int,
      isPresent,
      isBlank,
      Type,
      BaseException,
      stringify,
      Element,
      DOM,
      ListWrapper,
      List,
      MapWrapper,
      StringMapWrapper,
      reflector,
      Parser,
      ProtoChangeDetector,
      Component,
      Directive,
      DirectiveMetadata,
      ProtoView,
      ElementPropertyMemento,
      DirectivePropertyMemento,
      ProtoElementInjector,
      ElementBinder,
      CompileStep,
      CompileElement,
      CompileControl,
      ElementBinderBuilder;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      int = m.int;
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      Type = m.Type;
      BaseException = m.BaseException;
      stringify = m.stringify;
    }, function(m) {
      Element = m.Element;
      DOM = m.DOM;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      List = m.List;
      MapWrapper = m.MapWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      reflector = m.reflector;
    }, function(m) {
      Parser = m.Parser;
      ProtoChangeDetector = m.ProtoChangeDetector;
    }, function(m) {
      Component = m.Component;
      Directive = m.Directive;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      ProtoView = m.ProtoView;
      ElementPropertyMemento = m.ElementPropertyMemento;
      DirectivePropertyMemento = m.DirectivePropertyMemento;
    }, function(m) {
      ProtoElementInjector = m.ProtoElementInjector;
    }, function(m) {
      ElementBinder = m.ElementBinder;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      ElementBinderBuilder = $__export("ElementBinderBuilder", (function($__super) {
        var ElementBinderBuilder = function ElementBinderBuilder() {
          $traceurRuntime.superConstructor(ElementBinderBuilder).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(ElementBinderBuilder, {
          process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            var elementBinder = null;
            if (current.hasBindings) {
              var protoView = current.inheritedProtoView;
              elementBinder = protoView.bindElement(current.inheritedProtoElementInjector, current.componentDirective, current.templateDirective);
              if (isPresent(current.textNodeBindings)) {
                this._bindTextNodes(protoView, current);
              }
              if (isPresent(current.propertyBindings)) {
                this._bindElementProperties(protoView, current);
              }
              if (isPresent(current.eventBindings)) {
                this._bindEvents(protoView, current);
              }
              this._bindDirectiveProperties(current.getAllDirectives(), current);
            } else if (isPresent(parent)) {
              elementBinder = parent.inheritedElementBinder;
            }
            current.inheritedElementBinder = elementBinder;
          },
          _bindTextNodes: function(protoView, compileElement) {
            MapWrapper.forEach(compileElement.textNodeBindings, (function(expression, indexInParent) {
              protoView.bindTextNode(indexInParent, expression);
            }));
          },
          _bindElementProperties: function(protoView, compileElement) {
            MapWrapper.forEach(compileElement.propertyBindings, (function(expression, property) {
              if (DOM.hasProperty(compileElement.element, property)) {
                protoView.bindElementProperty(expression.ast, property, reflector.setter(property));
              }
            }));
          },
          _bindEvents: function(protoView, compileElement) {
            MapWrapper.forEach(compileElement.eventBindings, (function(expression, eventName) {
              protoView.bindEvent(eventName, expression);
            }));
          },
          _bindDirectiveProperties: function(directives, compileElement) {
            assert.argumentTypes(directives, List, compileElement, CompileElement);
            var protoView = compileElement.inheritedProtoView;
            for (var directiveIndex = 0; directiveIndex < directives.length; directiveIndex++) {
              var directive = ListWrapper.get(directives, directiveIndex);
              var annotation = directive.annotation;
              if (isBlank(annotation.bind))
                continue;
              StringMapWrapper.forEach(annotation.bind, function(dirProp, elProp) {
                var expression = isPresent(compileElement.propertyBindings) ? MapWrapper.get(compileElement.propertyBindings, elProp) : null;
                if (isBlank(expression)) {
                  throw new BaseException('No element binding found for property ' + elProp + ' which is required by directive ' + stringify(directive.type));
                }
                var len = dirProp.length;
                var dirBindingName = dirProp;
                var isContentWatch = dirProp[len - 2] === '[' && dirProp[len - 1] === ']';
                if (isContentWatch)
                  dirBindingName = dirProp.substring(0, len - 2);
                protoView.bindDirectiveProperty(directiveIndex, expression, dirBindingName, reflector.setter(dirBindingName), isContentWatch);
              });
            }
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(ElementBinderBuilder.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
      Object.defineProperty(ElementBinderBuilder.prototype._bindDirectiveProperties, "parameters", {get: function() {
          return [[List], [CompileElement]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/element_binding_marker", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "facade/dom", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/element_binding_marker";
  var assert,
      isPresent,
      MapWrapper,
      DOM,
      CompileStep,
      CompileElement,
      CompileControl,
      NG_BINDING_CLASS,
      ElementBindingMarker;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
    }, function(m) {
      MapWrapper = m.MapWrapper;
    }, function(m) {
      DOM = m.DOM;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      NG_BINDING_CLASS = 'ng-binding';
      ElementBindingMarker = $__export("ElementBindingMarker", (function($__super) {
        var ElementBindingMarker = function ElementBindingMarker() {
          $traceurRuntime.superConstructor(ElementBindingMarker).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(ElementBindingMarker, {process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            var hasBindings = (isPresent(current.textNodeBindings) && MapWrapper.size(current.textNodeBindings) > 0) || (isPresent(current.propertyBindings) && MapWrapper.size(current.propertyBindings) > 0) || (isPresent(current.variableBindings) && MapWrapper.size(current.variableBindings) > 0) || (isPresent(current.eventBindings) && MapWrapper.size(current.eventBindings) > 0) || (isPresent(current.decoratorDirectives) && current.decoratorDirectives.length > 0) || isPresent(current.templateDirective) || isPresent(current.componentDirective);
            if (hasBindings) {
              var element = current.element;
              DOM.addClass(element, NG_BINDING_CLASS);
              current.hasBindings = true;
            }
          }}, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(ElementBindingMarker.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/property_binding_parser", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "facade/dom", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/property_binding_parser";
  var assert,
      isPresent,
      isBlank,
      RegExpWrapper,
      BaseException,
      MapWrapper,
      TemplateElement,
      Parser,
      AST,
      ExpressionWithSource,
      CompileStep,
      CompileElement,
      CompileControl,
      BIND_NAME_REGEXP,
      PropertyBindingParser;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      RegExpWrapper = m.RegExpWrapper;
      BaseException = m.BaseException;
    }, function(m) {
      MapWrapper = m.MapWrapper;
    }, function(m) {
      TemplateElement = m.TemplateElement;
    }, function(m) {
      Parser = m.Parser;
      AST = m.AST;
      ExpressionWithSource = m.ExpressionWithSource;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      BIND_NAME_REGEXP = RegExpWrapper.create('^(?:(?:(bind)|(let)|(on))-(.+))|\\[([^\\]]+)\\]|\\(([^\\)]+)\\)');
      PropertyBindingParser = $__export("PropertyBindingParser", (function($__super) {
        var PropertyBindingParser = function PropertyBindingParser(parser, compilationUnit) {
          assert.argumentTypes(parser, Parser, compilationUnit, $traceurRuntime.type.any);
          this._parser = parser;
          this._compilationUnit = compilationUnit;
        };
        return ($traceurRuntime.createClass)(PropertyBindingParser, {
          process: function(parent, current, control) {
            var $__0 = this;
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            var attrs = current.attrs();
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
              if (isPresent(bindParts)) {
                if (isPresent(bindParts[1])) {
                  current.addPropertyBinding(bindParts[4], $__0._parseBinding(attrValue));
                } else if (isPresent(bindParts[2])) {
                  if (!(current.element instanceof TemplateElement)) {
                    throw new BaseException('let-* is only allowed on <template> elements!');
                  }
                  current.addVariableBinding(bindParts[4], attrValue);
                } else if (isPresent(bindParts[3])) {
                  current.addEventBinding(bindParts[4], $__0._parseAction(attrValue));
                } else if (isPresent(bindParts[5])) {
                  current.addPropertyBinding(bindParts[5], $__0._parseBinding(attrValue));
                } else if (isPresent(bindParts[6])) {
                  current.addEventBinding(bindParts[6], $__0._parseBinding(attrValue));
                }
              } else {
                var ast = $__0._parseInterpolation(attrValue);
                if (isPresent(ast)) {
                  current.addPropertyBinding(attrName, ast);
                }
              }
            }));
          },
          _parseInterpolation: function(input) {
            assert.argumentTypes(input, $traceurRuntime.type.string);
            return assert.returnType((this._parser.parseInterpolation(input, this._compilationUnit)), AST);
          },
          _parseBinding: function(input) {
            assert.argumentTypes(input, $traceurRuntime.type.string);
            return assert.returnType((this._parser.parseBinding(input, this._compilationUnit)), AST);
          },
          _parseAction: function(input) {
            assert.argumentTypes(input, $traceurRuntime.type.string);
            return assert.returnType((this._parser.parseAction(input, this._compilationUnit)), AST);
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(PropertyBindingParser, "parameters", {get: function() {
          return [[Parser], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(PropertyBindingParser.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
      Object.defineProperty(PropertyBindingParser.prototype._parseInterpolation, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(PropertyBindingParser.prototype._parseBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(PropertyBindingParser.prototype._parseAction, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/proto_element_injector_builder", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "di/di", "../element_injector", "./compile_step", "./compile_element", "./compile_control", "../directive_metadata"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/proto_element_injector_builder";
  var assert,
      isPresent,
      isBlank,
      ListWrapper,
      Key,
      ProtoElementInjector,
      ComponentKeyMetaData,
      DirectiveBinding,
      CompileStep,
      CompileElement,
      CompileControl,
      DirectiveMetadata,
      ProtoElementInjectorBuilder;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
    }, function(m) {
      ListWrapper = m.ListWrapper;
    }, function(m) {
      Key = m.Key;
    }, function(m) {
      ProtoElementInjector = m.ProtoElementInjector;
      ComponentKeyMetaData = m.ComponentKeyMetaData;
      DirectiveBinding = m.DirectiveBinding;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }],
    execute: function() {
      ProtoElementInjectorBuilder = $__export("ProtoElementInjectorBuilder", (function($__super) {
        var ProtoElementInjectorBuilder = function ProtoElementInjectorBuilder() {
          $traceurRuntime.superConstructor(ProtoElementInjectorBuilder).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(ProtoElementInjectorBuilder, {
          internalCreateProtoElementInjector: function(parent, index, directives, firstBindingIsComponent, distance) {
            return new ProtoElementInjector(parent, index, directives, firstBindingIsComponent, distance);
          },
          process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            var distanceToParentInjector = this._getDistanceToParentInjector(parent, current);
            var parentProtoElementInjector = this._getParentProtoElementInjector(parent, current);
            var injectorBindings = ListWrapper.map(current.getAllDirectives(), this._createBinding);
            if (injectorBindings.length > 0) {
              var protoView = current.inheritedProtoView;
              var hasComponent = isPresent(current.componentDirective);
              current.inheritedProtoElementInjector = this.internalCreateProtoElementInjector(parentProtoElementInjector, protoView.elementBinders.length, injectorBindings, hasComponent, distanceToParentInjector);
              current.distanceToParentInjector = 0;
            } else {
              current.inheritedProtoElementInjector = parentProtoElementInjector;
              current.distanceToParentInjector = distanceToParentInjector;
            }
          },
          _getDistanceToParentInjector: function(parent, current) {
            return isPresent(parent) ? parent.distanceToParentInjector + 1 : 0;
          },
          _getParentProtoElementInjector: function(parent, current) {
            if (isPresent(parent) && !current.isViewRoot) {
              return parent.inheritedProtoElementInjector;
            }
            return null;
          },
          _createBinding: function(d) {
            assert.argumentTypes(d, DirectiveMetadata);
            return assert.returnType((DirectiveBinding.createFromType(d.type, d.annotation)), DirectiveBinding);
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(ProtoElementInjectorBuilder.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
      Object.defineProperty(ProtoElementInjectorBuilder.prototype._createBinding, "parameters", {get: function() {
          return [[DirectiveMetadata]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/proto_view_builder", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "../view", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/proto_view_builder";
  var assert,
      isPresent,
      BaseException,
      ListWrapper,
      MapWrapper,
      ProtoView,
      ProtoChangeDetector,
      CompileStep,
      CompileElement,
      CompileControl,
      ProtoViewBuilder;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isPresent = m.isPresent;
      BaseException = m.BaseException;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      ProtoView = m.ProtoView;
    }, function(m) {
      ProtoChangeDetector = m.ProtoChangeDetector;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      ProtoViewBuilder = $__export("ProtoViewBuilder", (function($__super) {
        var ProtoViewBuilder = function ProtoViewBuilder() {
          $traceurRuntime.superConstructor(ProtoViewBuilder).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(ProtoViewBuilder, {process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            var inheritedProtoView = null;
            if (current.isViewRoot) {
              inheritedProtoView = new ProtoView(current.element, new ProtoChangeDetector());
              if (isPresent(parent)) {
                if (isPresent(parent.inheritedElementBinder.nestedProtoView)) {
                  throw new BaseException('Only one nested view per element is allowed');
                }
                parent.inheritedElementBinder.nestedProtoView = inheritedProtoView;
                if (isPresent(parent.variableBindings)) {
                  MapWrapper.forEach(parent.variableBindings, (function(mappedName, varName) {
                    inheritedProtoView.bindVariable(varName, mappedName);
                  }));
                }
              }
            } else if (isPresent(parent)) {
              inheritedProtoView = parent.inheritedProtoView;
            }
            current.inheritedProtoView = inheritedProtoView;
          }}, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(ProtoViewBuilder.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/text_interpolation_parser", ["rtts_assert/rtts_assert", "facade/lang", "facade/dom", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/text_interpolation_parser";
  var assert,
      RegExpWrapper,
      StringWrapper,
      isPresent,
      Node,
      DOM,
      Parser,
      CompileStep,
      CompileElement,
      CompileControl,
      TextInterpolationParser;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      RegExpWrapper = m.RegExpWrapper;
      StringWrapper = m.StringWrapper;
      isPresent = m.isPresent;
    }, function(m) {
      Node = m.Node;
      DOM = m.DOM;
    }, function(m) {
      Parser = m.Parser;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      TextInterpolationParser = $__export("TextInterpolationParser", (function($__super) {
        var TextInterpolationParser = function TextInterpolationParser(parser, compilationUnit) {
          assert.argumentTypes(parser, Parser, compilationUnit, $traceurRuntime.type.any);
          this._parser = parser;
          this._compilationUnit = compilationUnit;
        };
        return ($traceurRuntime.createClass)(TextInterpolationParser, {
          process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            if (!current.compileChildren) {
              return ;
            }
            var element = current.element;
            var childNodes = DOM.templateAwareRoot(element).childNodes;
            for (var i = 0; i < childNodes.length; i++) {
              var node = childNodes[i];
              if (node.nodeType === Node.TEXT_NODE) {
                this._parseTextNode(current, node, i);
              }
            }
          },
          _parseTextNode: function(pipelineElement, node, nodeIndex) {
            var ast = this._parser.parseInterpolation(node.nodeValue, this._compilationUnit);
            if (isPresent(ast)) {
              DOM.setText(node, ' ');
              pipelineElement.addTextNodeBinding(nodeIndex, ast);
            }
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(TextInterpolationParser, "parameters", {get: function() {
          return [[Parser], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(TextInterpolationParser.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});




System.register("core/compiler/pipeline/view_splitter", ["rtts_assert/rtts_assert", "facade/lang", "facade/dom", "facade/collection", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/view_splitter";
  var assert,
      isBlank,
      isPresent,
      DOM,
      TemplateElement,
      MapWrapper,
      ListWrapper,
      Parser,
      CompileStep,
      CompileElement,
      CompileControl,
      ViewSplitter;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      isBlank = m.isBlank;
      isPresent = m.isPresent;
    }, function(m) {
      DOM = m.DOM;
      TemplateElement = m.TemplateElement;
    }, function(m) {
      MapWrapper = m.MapWrapper;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      Parser = m.Parser;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      ViewSplitter = $__export("ViewSplitter", (function($__super) {
        var ViewSplitter = function ViewSplitter(parser, compilationUnit) {
          assert.argumentTypes(parser, Parser, compilationUnit, $traceurRuntime.type.any);
          this._parser = parser;
          this._compilationUnit = compilationUnit;
        };
        return ($traceurRuntime.createClass)(ViewSplitter, {
          process: function(parent, current, control) {
            assert.argumentTypes(parent, CompileElement, current, CompileElement, control, CompileControl);
            if (isBlank(parent)) {
              current.isViewRoot = true;
            } else {
              if (current.element instanceof TemplateElement) {
                if (!current.isViewRoot) {
                  var viewRoot = new CompileElement(DOM.createTemplate(''));
                  var currentElement = assert.type(current.element, TemplateElement);
                  var viewRootElement = assert.type(viewRoot.element, TemplateElement);
                  this._moveChildNodes(currentElement.content, viewRootElement.content);
                  viewRoot.isViewRoot = true;
                  control.addChild(viewRoot);
                }
              } else {
                var templateBindings = MapWrapper.get(current.attrs(), 'template');
                if (isPresent(templateBindings)) {
                  var newParent = new CompileElement(DOM.createTemplate(''));
                  current.isViewRoot = true;
                  this._parseTemplateBindings(templateBindings, newParent);
                  this._addParentElement(current.element, newParent.element);
                  control.addParent(newParent);
                  current.element.remove();
                }
              }
            }
          },
          _moveChildNodes: function(source, target) {
            while (isPresent(source.firstChild)) {
              DOM.appendChild(target, source.firstChild);
            }
          },
          _addParentElement: function(currentElement, newParentElement) {
            DOM.insertBefore(currentElement, newParentElement);
            DOM.appendChild(newParentElement, currentElement);
          },
          _parseTemplateBindings: function(templateBindings, compileElement) {
            assert.argumentTypes(templateBindings, $traceurRuntime.type.string, compileElement, CompileElement);
            var bindings = this._parser.parseTemplateBindings(templateBindings, this._compilationUnit);
            for (var i = 0; i < bindings.length; i++) {
              var binding = bindings[i];
              if (isPresent(binding.name)) {
                compileElement.addVariableBinding(binding.key, binding.name);
              } else if (isPresent(binding.expression)) {
                compileElement.addPropertyBinding(binding.key, binding.expression);
              } else {
                compileElement.element.setAttribute(binding.key, '');
              }
            }
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(ViewSplitter, "parameters", {get: function() {
          return [[Parser], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(ViewSplitter.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
      Object.defineProperty(ViewSplitter.prototype._parseTemplateBindings, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [CompileElement]];
        }});
    }
  };
});




System.register("core/compiler/shadow_dom_emulation/content_tag", ["rtts_assert/rtts_assert", "../../annotations/annotations", "./light_dom", "di/di", "facade/dom", "facade/lang", "facade/collection", "core/dom/element"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/shadow_dom_emulation/content_tag";
  var assert,
      Decorator,
      SourceLightDom,
      DestinationLightDom,
      LightDom,
      Inject,
      Element,
      Node,
      DOM,
      isPresent,
      List,
      ListWrapper,
      NgElement,
      _scriptTemplate,
      ContentStrategy,
      RenderedContent,
      IntermediateContent,
      Content;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Decorator = m.Decorator;
    }, function(m) {
      SourceLightDom = m.SourceLightDom;
      DestinationLightDom = m.DestinationLightDom;
      LightDom = m.LightDom;
    }, function(m) {
      Inject = m.Inject;
    }, function(m) {
      Element = m.Element;
      Node = m.Node;
      DOM = m.DOM;
    }, function(m) {
      isPresent = m.isPresent;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      NgElement = m.NgElement;
    }],
    execute: function() {
      _scriptTemplate = DOM.createScriptTag('type', 'ng/content');
      ContentStrategy = (function() {
        var ContentStrategy = function ContentStrategy() {};
        return ($traceurRuntime.createClass)(ContentStrategy, {insert: function(nodes) {
            assert.argumentTypes(nodes, List);
          }}, {});
      }());
      Object.defineProperty(ContentStrategy.prototype.insert, "parameters", {get: function() {
          return [[List]];
        }});
      RenderedContent = (function($__super) {
        var RenderedContent = function RenderedContent(el) {
          assert.argumentTypes(el, Element);
          this._replaceContentElementWithScriptTags(el);
          this.nodes = [];
        };
        return ($traceurRuntime.createClass)(RenderedContent, {
          insert: function(nodes) {
            assert.argumentTypes(nodes, List);
            this.nodes = nodes;
            DOM.insertAllBefore(this.endScript, nodes);
            this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this.endScript : nodes[0]);
          },
          _replaceContentElementWithScriptTags: function(contentEl) {
            assert.argumentTypes(contentEl, Element);
            this.beginScript = DOM.clone(_scriptTemplate);
            this.endScript = DOM.clone(_scriptTemplate);
            DOM.insertBefore(contentEl, this.beginScript);
            DOM.insertBefore(contentEl, this.endScript);
            DOM.removeChild(DOM.parentElement(contentEl), contentEl);
          },
          _removeNodesUntil: function(node) {
            assert.argumentTypes(node, Node);
            var p = DOM.parentElement(this.beginScript);
            for (var next = DOM.nextSibling(this.beginScript); next !== node; next = DOM.nextSibling(this.beginScript)) {
              DOM.removeChild(p, next);
            }
          }
        }, {}, $__super);
      }(ContentStrategy));
      Object.defineProperty(RenderedContent, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(RenderedContent.prototype.insert, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(RenderedContent.prototype._replaceContentElementWithScriptTags, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(RenderedContent.prototype._removeNodesUntil, "parameters", {get: function() {
          return [[Node]];
        }});
      IntermediateContent = (function($__super) {
        var IntermediateContent = function IntermediateContent(destinationLightDom) {
          assert.argumentTypes(destinationLightDom, LightDom);
          this.destinationLightDom = destinationLightDom;
          this.nodes = [];
        };
        return ($traceurRuntime.createClass)(IntermediateContent, {insert: function(nodes) {
            assert.argumentTypes(nodes, List);
            this.nodes = nodes;
            this.destinationLightDom.redistribute();
          }}, {}, $__super);
      }(ContentStrategy));
      Object.defineProperty(IntermediateContent, "parameters", {get: function() {
          return [[LightDom]];
        }});
      Object.defineProperty(IntermediateContent.prototype.insert, "parameters", {get: function() {
          return [[List]];
        }});
      Content = $__export("Content", (function() {
        var Content = function Content(destinationLightDom, contentEl) {
          assert.argumentTypes(destinationLightDom, $traceurRuntime.type.any, contentEl, NgElement);
          this.select = contentEl.getAttribute('select');
          this._strategy = isPresent(destinationLightDom) ? new IntermediateContent(destinationLightDom) : new RenderedContent(contentEl.domElement);
        };
        return ($traceurRuntime.createClass)(Content, {
          nodes: function() {
            return assert.returnType((this._strategy.nodes), List);
          },
          insert: function(nodes) {
            assert.argumentTypes(nodes, List);
            this._strategy.insert(nodes);
          }
        }, {});
      }()));
      Object.defineProperty(Content, "annotations", {get: function() {
          return [new Decorator({selector: 'content'})];
        }});
      Object.defineProperty(Content, "parameters", {get: function() {
          return [[new Inject(DestinationLightDom)], [NgElement]];
        }});
      Object.defineProperty(Content.prototype.insert, "parameters", {get: function() {
          return [[List]];
        }});
    }
  };
});




System.register("core/compiler/shadow_dom_emulation/light_dom", ["rtts_assert/rtts_assert", "facade/dom", "facade/collection", "facade/lang", "../view", "../element_injector", "../viewport", "./content_tag"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/shadow_dom_emulation/light_dom";
  var assert,
      Element,
      Node,
      DOM,
      List,
      ListWrapper,
      isBlank,
      isPresent,
      View,
      ElementInjector,
      ViewPort,
      Content,
      SourceLightDom,
      DestinationLightDom,
      _Root,
      LightDom;
  function redistributeNodes(contents, nodes) {
    for (var i = 0; i < contents.length; ++i) {
      var content = contents[i];
      var select = content.select;
      var matchSelector = (function(n) {
        return DOM.elementMatches(n, select);
      });
      if (isBlank(select)) {
        content.insert(nodes);
        ListWrapper.clear(nodes);
      } else {
        var matchingNodes = ListWrapper.filter(nodes, matchSelector);
        content.insert(matchingNodes);
        ListWrapper.removeAll(nodes, matchingNodes);
      }
    }
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Element = m.Element;
      Node = m.Node;
      DOM = m.DOM;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      isBlank = m.isBlank;
      isPresent = m.isPresent;
    }, function(m) {
      View = m.View;
    }, function(m) {
      ElementInjector = m.ElementInjector;
    }, function(m) {
      ViewPort = m.ViewPort;
    }, function(m) {
      Content = m.Content;
    }],
    execute: function() {
      SourceLightDom = $__export("SourceLightDom", (function() {
        var SourceLightDom = function SourceLightDom() {};
        return ($traceurRuntime.createClass)(SourceLightDom, {}, {});
      }()));
      DestinationLightDom = $__export("DestinationLightDom", (function() {
        var DestinationLightDom = function DestinationLightDom() {};
        return ($traceurRuntime.createClass)(DestinationLightDom, {}, {});
      }()));
      _Root = (function() {
        var _Root = function _Root(node, injector) {
          this.node = node;
          this.injector = injector;
        };
        return ($traceurRuntime.createClass)(_Root, {}, {});
      }());
      LightDom = $__export("LightDom", (function() {
        var LightDom = function LightDom(lightDomView, shadowDomView, element) {
          assert.argumentTypes(lightDomView, View, shadowDomView, View, element, Element);
          this.lightDomView = lightDomView;
          this.shadowDomView = shadowDomView;
          this.nodes = DOM.childNodesAsList(element);
          this.roots = null;
        };
        return ($traceurRuntime.createClass)(LightDom, {
          redistribute: function() {
            var tags = this.contentTags();
            if (isPresent(tags)) {
              redistributeNodes(tags, this.expandedDomNodes());
            }
          },
          contentTags: function() {
            return assert.returnType((this._collectAllContentTags(this.shadowDomView, [])), List);
          },
          _collectAllContentTags: function(item, acc) {
            var $__0 = this;
            assert.argumentTypes(item, $traceurRuntime.type.any, acc, List);
            var eis = item.elementInjectors;
            for (var i = 0; i < eis.length; ++i) {
              var ei = eis[i];
              if (isBlank(ei))
                continue;
              if (ei.hasDirective(Content)) {
                ListWrapper.push(acc, ei.get(Content));
              } else if (ei.hasPreBuiltObject(ViewPort)) {
                var vp = ei.get(ViewPort);
                ListWrapper.forEach(vp.contentTagContainers(), (function(c) {
                  $__0._collectAllContentTags(c, acc);
                }));
              }
            }
            return assert.returnType((acc), List);
          },
          expandedDomNodes: function() {
            var res = [];
            var roots = this._roots();
            for (var i = 0; i < roots.length; ++i) {
              var root = roots[i];
              var ei = root.injector;
              if (isPresent(ei) && ei.hasPreBuiltObject(ViewPort)) {
                var vp = root.injector.get(ViewPort);
                res = ListWrapper.concat(res, vp.nodes());
              } else if (isPresent(ei) && ei.hasDirective(Content)) {
                var content = root.injector.get(Content);
                res = ListWrapper.concat(res, content.nodes());
              } else {
                ListWrapper.push(res, root.node);
              }
            }
            return assert.returnType((res), List);
          },
          _roots: function() {
            if (isPresent(this.roots))
              return this.roots;
            var viewInj = this.lightDomView.elementInjectors;
            this.roots = ListWrapper.map(this.nodes, (function(n) {
              return new _Root(n, ListWrapper.find(viewInj, (function(inj) {
                return inj.forElement(n);
              })));
            }));
            return this.roots;
          }
        }, {});
      }()));
      Object.defineProperty(LightDom, "parameters", {get: function() {
          return [[View], [View], [Element]];
        }});
      Object.defineProperty(LightDom.prototype._collectAllContentTags, "parameters", {get: function() {
          return [[], [List]];
        }});
      Object.defineProperty(redistributeNodes, "parameters", {get: function() {
          return [[List], [List]];
        }});
    }
  };
});




System.register("core/application", ["rtts_assert/rtts_assert", "di/di", "facade/lang", "facade/dom", "./compiler/compiler", "./compiler/view", "reflection/reflection", "change_detection/change_detection", "./compiler/template_loader", "./compiler/directive_metadata_reader", "./compiler/directive_metadata", "facade/collection", "facade/async", "core/zone/vm_turn_zone", "core/life_cycle/life_cycle"], function($__export) {
  "use strict";
  var __moduleName = "core/application";
  var assert,
      Injector,
      bind,
      OpaqueToken,
      Type,
      FIELD,
      isBlank,
      isPresent,
      BaseException,
      assertionsEnabled,
      print,
      DOM,
      Element,
      Compiler,
      CompilerCache,
      ProtoView,
      Reflector,
      reflector,
      Parser,
      Lexer,
      ChangeDetector,
      TemplateLoader,
      DirectiveMetadataReader,
      DirectiveMetadata,
      List,
      ListWrapper,
      PromiseWrapper,
      VmTurnZone,
      LifeCycle,
      _rootInjector,
      _rootBindings,
      appViewToken,
      appChangeDetectorToken,
      appElementToken,
      appComponentAnnotatedTypeToken,
      appDocumentToken;
  function _injectorBindings(appComponentType) {
    return [bind(appDocumentToken).toValue(DOM.defaultDoc()), bind(appComponentAnnotatedTypeToken).toFactory((function(reader) {
      return reader.read(appComponentType);
    }), [DirectiveMetadataReader]), bind(appElementToken).toFactory((function(appComponentAnnotatedType, appDocument) {
      var selector = appComponentAnnotatedType.annotation.selector;
      var element = DOM.querySelector(appDocument, selector);
      if (isBlank(element)) {
        throw new BaseException(("The app selector \"" + selector + "\" did not match any elements"));
      }
      return element;
    }), [appComponentAnnotatedTypeToken, appDocumentToken]), bind(appViewToken).toAsyncFactory((function(compiler, injector, appElement, appComponentAnnotatedType) {
      return compiler.compile(appComponentAnnotatedType.type, null).then((function(protoView) {
        var appProtoView = ProtoView.createRootProtoView(protoView, appElement, appComponentAnnotatedType);
        var view = appProtoView.instantiate(null);
        view.hydrate(injector, null, new Object());
        return view;
      }));
    }), [Compiler, Injector, appElementToken, appComponentAnnotatedTypeToken]), bind(appChangeDetectorToken).toFactory((function(rootView) {
      return rootView.changeDetector;
    }), [appViewToken]), bind(appComponentType).toFactory((function(rootView) {
      return rootView.elementInjectors[0].getComponent();
    }), [appViewToken]), bind(LifeCycle).toFactory((function(cd) {
      return new LifeCycle(cd, assertionsEnabled());
    }), [appChangeDetectorToken])];
  }
  function _createVmZone(givenReporter) {
    assert.argumentTypes(givenReporter, Function);
    var defaultErrorReporter = (function(exception, stackTrace) {
      var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
      print((exception + "\n\n" + longStackTrace));
      throw exception;
    });
    var reporter = isPresent(givenReporter) ? givenReporter : defaultErrorReporter;
    var zone = new VmTurnZone({enableLongStackTrace: assertionsEnabled()});
    zone.initCallbacks({onErrorHandler: reporter});
    return zone;
  }
  function bootstrap(appComponentType) {
    var bindings = arguments[1] !== (void 0) ? arguments[1] : null;
    var givenBootstrapErrorReporter = arguments[2] !== (void 0) ? arguments[2] : null;
    assert.argumentTypes(appComponentType, Type, bindings, $traceurRuntime.type.any, givenBootstrapErrorReporter, $traceurRuntime.type.any);
    var bootstrapProcess = PromiseWrapper.completer();
    var zone = _createVmZone(givenBootstrapErrorReporter);
    zone.run((function() {
      var appInjector = _createAppInjector(appComponentType, bindings);
      PromiseWrapper.then(appInjector.asyncGet(LifeCycle), (function(lc) {
        lc.registerWith(zone);
        lc.tick();
        bootstrapProcess.complete(appInjector);
      }), (function(err) {
        bootstrapProcess.reject(err);
      }));
    }));
    return bootstrapProcess.promise;
  }
  function _createAppInjector(appComponentType, bindings) {
    assert.argumentTypes(appComponentType, Type, bindings, List);
    if (isBlank(_rootInjector))
      _rootInjector = new Injector(_rootBindings);
    var mergedBindings = isPresent(bindings) ? ListWrapper.concat(_injectorBindings(appComponentType), bindings) : _injectorBindings(appComponentType);
    return assert.returnType((_rootInjector.createChild(mergedBindings)), Injector);
  }
  $__export("bootstrap", bootstrap);
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Injector = m.Injector;
      bind = m.bind;
      OpaqueToken = m.OpaqueToken;
    }, function(m) {
      Type = m.Type;
      FIELD = m.FIELD;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      BaseException = m.BaseException;
      assertionsEnabled = m.assertionsEnabled;
      print = m.print;
    }, function(m) {
      DOM = m.DOM;
      Element = m.Element;
    }, function(m) {
      Compiler = m.Compiler;
      CompilerCache = m.CompilerCache;
    }, function(m) {
      ProtoView = m.ProtoView;
    }, function(m) {
      Reflector = m.Reflector;
      reflector = m.reflector;
    }, function(m) {
      Parser = m.Parser;
      Lexer = m.Lexer;
      ChangeDetector = m.ChangeDetector;
    }, function(m) {
      TemplateLoader = m.TemplateLoader;
    }, function(m) {
      DirectiveMetadataReader = m.DirectiveMetadataReader;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      PromiseWrapper = m.PromiseWrapper;
    }, function(m) {
      VmTurnZone = m.VmTurnZone;
    }, function(m) {
      LifeCycle = m.LifeCycle;
    }],
    execute: function() {
      _rootBindings = [bind(Reflector).toValue(reflector), Compiler, CompilerCache, TemplateLoader, DirectiveMetadataReader, Parser, Lexer];
      appViewToken = $__export("appViewToken", new OpaqueToken('AppView'));
      appChangeDetectorToken = $__export("appChangeDetectorToken", new OpaqueToken('AppChangeDetector'));
      appElementToken = $__export("appElementToken", new OpaqueToken('AppElement'));
      appComponentAnnotatedTypeToken = $__export("appComponentAnnotatedTypeToken", new OpaqueToken('AppComponentAnnotatedType'));
      appDocumentToken = $__export("appDocumentToken", new OpaqueToken('AppDocument'));
      Object.defineProperty(_createVmZone, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(bootstrap, "parameters", {get: function() {
          return [[Type], [], []];
        }});
      Object.defineProperty(_createAppInjector, "parameters", {get: function() {
          return [[Type], [List]];
        }});
    }
  };
});




System.register("core/core", ["./annotations/annotations", "./compiler/interfaces", "./annotations/template_config", "./application", "./compiler/compiler", "./compiler/template_loader", "./compiler/view", "./compiler/viewport", "./dom/element"], function($__export) {
  "use strict";
  var __moduleName = "core/core";
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  return {
    setters: [function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }],
    execute: function() {}
  };
});




System.register("core/annotations/annotations", ["facade/lang", "facade/collection", "./template_config", "../compiler/shadow_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/annotations/annotations";
  var ABSTRACT,
      CONST,
      normalizeBlank,
      List,
      TemplateConfig,
      ShadowDomStrategy,
      Directive,
      Component,
      Decorator,
      Template,
      onDestroy;
  return {
    setters: [function(m) {
      ABSTRACT = m.ABSTRACT;
      CONST = m.CONST;
      normalizeBlank = m.normalizeBlank;
    }, function(m) {
      List = m.List;
    }, function(m) {
      TemplateConfig = m.TemplateConfig;
    }, function(m) {
      ShadowDomStrategy = m.ShadowDomStrategy;
    }],
    execute: function() {
      Directive = $__export("Directive", (function() {
        var Directive = function Directive() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__1.selector,
              bind = $__1.bind,
              lightDomServices = $__1.lightDomServices,
              implementsTypes = $__1.implementsTypes,
              lifecycle = $__1.lifecycle;
          this.selector = selector;
          this.lightDomServices = lightDomServices;
          this.implementsTypes = implementsTypes;
          this.bind = bind;
          this.lifecycle = lifecycle;
        };
        return ($traceurRuntime.createClass)(Directive, {}, {});
      }()));
      Object.defineProperty(Directive, "annotations", {get: function() {
          return [new ABSTRACT(), new CONST()];
        }});
      Component = $__export("Component", (function($__super) {
        var Component = function Component() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__1.selector,
              bind = $__1.bind,
              template = $__1.template,
              lightDomServices = $__1.lightDomServices,
              shadowDomServices = $__1.shadowDomServices,
              componentServices = $__1.componentServices,
              implementsTypes = $__1.implementsTypes,
              shadowDom = $__1.shadowDom,
              lifecycle = $__1.lifecycle;
          $traceurRuntime.superConstructor(Component).call(this, {
            selector: selector,
            bind: bind,
            lightDomServices: lightDomServices,
            implementsTypes: implementsTypes,
            lifecycle: lifecycle
          });
          this.template = template;
          this.lightDomServices = lightDomServices;
          this.shadowDomServices = shadowDomServices;
          this.componentServices = componentServices;
          this.shadowDom = shadowDom;
          this.lifecycle = lifecycle;
        };
        return ($traceurRuntime.createClass)(Component, {}, {}, $__super);
      }(Directive)));
      Object.defineProperty(Component, "annotations", {get: function() {
          return [new CONST()];
        }});
      Decorator = $__export("Decorator", (function($__super) {
        var Decorator = function Decorator() {
          var $__2;
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__1.selector,
              bind = $__1.bind,
              lightDomServices = $__1.lightDomServices,
              implementsTypes = $__1.implementsTypes,
              lifecycle = $__1.lifecycle,
              compileChildren = ($__2 = $__1.compileChildren) === void 0 ? true : $__2;
          this.compileChildren = compileChildren;
          $traceurRuntime.superConstructor(Decorator).call(this, {
            selector: selector,
            bind: bind,
            lightDomServices: lightDomServices,
            implementsTypes: implementsTypes,
            lifecycle: lifecycle
          });
        };
        return ($traceurRuntime.createClass)(Decorator, {}, {}, $__super);
      }(Directive)));
      Object.defineProperty(Decorator, "annotations", {get: function() {
          return [new CONST()];
        }});
      Template = $__export("Template", (function($__super) {
        var Template = function Template() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__1.selector,
              bind = $__1.bind,
              lightDomServices = $__1.lightDomServices,
              implementsTypes = $__1.implementsTypes,
              lifecycle = $__1.lifecycle;
          $traceurRuntime.superConstructor(Template).call(this, {
            selector: selector,
            bind: bind,
            lightDomServices: lightDomServices,
            implementsTypes: implementsTypes,
            lifecycle: lifecycle
          });
        };
        return ($traceurRuntime.createClass)(Template, {}, {}, $__super);
      }(Directive)));
      Object.defineProperty(Template, "annotations", {get: function() {
          return [new CONST()];
        }});
      onDestroy = $__export("onDestroy", "onDestroy");
    }
  };
});




System.register("core/annotations/events", ["facade/lang", "di/di"], function($__export) {
  "use strict";
  var __moduleName = "core/annotations/events";
  var CONST,
      DependencyAnnotation,
      EventEmitter;
  return {
    setters: [function(m) {
      CONST = m.CONST;
    }, function(m) {
      DependencyAnnotation = m.DependencyAnnotation;
    }],
    execute: function() {
      EventEmitter = $__export("EventEmitter", (function($__super) {
        var EventEmitter = function EventEmitter(eventName) {
          this.eventName = eventName;
        };
        return ($traceurRuntime.createClass)(EventEmitter, {}, {}, $__super);
      }(DependencyAnnotation)));
      Object.defineProperty(EventEmitter, "annotations", {get: function() {
          return [new CONST()];
        }});
    }
  };
});




System.register("core/annotations/template_config", ["facade/lang", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "core/annotations/template_config";
  var ABSTRACT,
      CONST,
      Type,
      List,
      TemplateConfig;
  return {
    setters: [function(m) {
      ABSTRACT = m.ABSTRACT;
      CONST = m.CONST;
      Type = m.Type;
    }, function(m) {
      List = m.List;
    }],
    execute: function() {
      TemplateConfig = $__export("TemplateConfig", (function() {
        var TemplateConfig = function TemplateConfig($__1) {
          var $__2 = $__1,
              url = $__2.url,
              inline = $__2.inline,
              directives = $__2.directives,
              formatters = $__2.formatters,
              source = $__2.source;
          this.url = url;
          this.inline = inline;
          this.directives = directives;
          this.formatters = formatters;
          this.source = source;
        };
        return ($traceurRuntime.createClass)(TemplateConfig, {}, {});
      }()));
      Object.defineProperty(TemplateConfig, "annotations", {get: function() {
          return [new CONST()];
        }});
    }
  };
});




System.register("core/annotations/visibility", ["facade/lang", "di/di"], function($__export) {
  "use strict";
  var __moduleName = "core/annotations/visibility";
  var CONST,
      DependencyAnnotation,
      Parent,
      Ancestor;
  return {
    setters: [function(m) {
      CONST = m.CONST;
    }, function(m) {
      DependencyAnnotation = m.DependencyAnnotation;
    }],
    execute: function() {
      Parent = $__export("Parent", (function($__super) {
        var Parent = function Parent() {};
        return ($traceurRuntime.createClass)(Parent, {}, {}, $__super);
      }(DependencyAnnotation)));
      Object.defineProperty(Parent, "annotations", {get: function() {
          return [new CONST()];
        }});
      Ancestor = $__export("Ancestor", (function($__super) {
        var Ancestor = function Ancestor() {};
        return ($traceurRuntime.createClass)(Ancestor, {}, {}, $__super);
      }(DependencyAnnotation)));
      Object.defineProperty(Ancestor, "annotations", {get: function() {
          return [new CONST()];
        }});
    }
  };
});




System.register("core/compiler/compiler", ["rtts_assert/rtts_assert", "facade/lang", "facade/async", "facade/collection", "facade/dom", "change_detection/change_detection", "./directive_metadata_reader", "./view", "./pipeline/compile_pipeline", "./pipeline/compile_element", "./pipeline/default_steps", "./template_loader", "./directive_metadata", "../annotations/annotations", "./shadow_dom_emulation/content_tag"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/compiler";
  var assert,
      Type,
      FIELD,
      isBlank,
      isPresent,
      BaseException,
      stringify,
      Promise,
      PromiseWrapper,
      List,
      ListWrapper,
      MapWrapper,
      DOM,
      Element,
      Parser,
      DirectiveMetadataReader,
      ProtoView,
      CompilePipeline,
      CompileElement,
      createDefaultSteps,
      TemplateLoader,
      DirectiveMetadata,
      Component,
      Content,
      CompilerCache,
      Compiler;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Type = m.Type;
      FIELD = m.FIELD;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      BaseException = m.BaseException;
      stringify = m.stringify;
    }, function(m) {
      Promise = m.Promise;
      PromiseWrapper = m.PromiseWrapper;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      DOM = m.DOM;
      Element = m.Element;
    }, function(m) {
      Parser = m.Parser;
    }, function(m) {
      DirectiveMetadataReader = m.DirectiveMetadataReader;
    }, function(m) {
      ProtoView = m.ProtoView;
    }, function(m) {
      CompilePipeline = m.CompilePipeline;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      createDefaultSteps = m.createDefaultSteps;
    }, function(m) {
      TemplateLoader = m.TemplateLoader;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      Component = m.Component;
    }, function(m) {
      Content = m.Content;
    }],
    execute: function() {
      CompilerCache = $__export("CompilerCache", (function() {
        var CompilerCache = function CompilerCache() {
          this._cache = MapWrapper.create();
        };
        return ($traceurRuntime.createClass)(CompilerCache, {
          set: function(component, protoView) {
            assert.argumentTypes(component, Type, protoView, ProtoView);
            MapWrapper.set(this._cache, component, protoView);
          },
          get: function(component) {
            assert.argumentTypes(component, Type);
            var result = MapWrapper.get(this._cache, component);
            if (isBlank(result)) {
              return assert.returnType((null), ProtoView);
            }
            return assert.returnType((result), ProtoView);
          },
          clear: function() {
            this._cache = MapWrapper.create();
          }
        }, {});
      }()));
      Object.defineProperty(CompilerCache.prototype.set, "parameters", {get: function() {
          return [[Type], [ProtoView]];
        }});
      Object.defineProperty(CompilerCache.prototype.get, "parameters", {get: function() {
          return [[Type]];
        }});
      Compiler = $__export("Compiler", (function() {
        var Compiler = function Compiler(templateLoader, reader, parser, cache) {
          assert.argumentTypes(templateLoader, TemplateLoader, reader, DirectiveMetadataReader, parser, Parser, cache, CompilerCache);
          this._templateLoader = templateLoader;
          this._reader = reader;
          this._parser = parser;
          this._compilerCache = cache;
        };
        return ($traceurRuntime.createClass)(Compiler, {
          createSteps: function(component) {
            var $__0 = this;
            var dirs = ListWrapper.map(component.componentDirectives, (function(d) {
              return $__0._reader.read(d);
            }));
            return assert.returnType((createDefaultSteps(this._parser, component, dirs)), List);
          },
          compile: function(component) {
            var templateRoot = arguments[1] !== (void 0) ? arguments[1] : null;
            assert.argumentTypes(component, Type, templateRoot, Element);
            var templateCache = null;
            return assert.returnType((PromiseWrapper.resolve(this.compileAllLoaded(templateCache, this._reader.read(component), templateRoot))), Promise);
          },
          compileAllLoaded: function(templateCache, component) {
            var templateRoot = arguments[2] !== (void 0) ? arguments[2] : null;
            assert.argumentTypes(templateCache, $traceurRuntime.type.any, component, DirectiveMetadata, templateRoot, Element);
            var rootProtoView = this._compilerCache.get(component.type);
            if (isPresent(rootProtoView)) {
              return assert.returnType((rootProtoView), ProtoView);
            }
            if (isBlank(templateRoot)) {
              var annotation = assert.type(component.annotation, $traceurRuntime.type.any);
              templateRoot = DOM.createTemplate(annotation.template.inline);
            }
            var pipeline = new CompilePipeline(this.createSteps(component));
            var compileElements = pipeline.process(templateRoot);
            rootProtoView = compileElements[0].inheritedProtoView;
            this._compilerCache.set(component.type, rootProtoView);
            for (var i = 0; i < compileElements.length; i++) {
              var ce = compileElements[i];
              if (isPresent(ce.componentDirective)) {
                ce.inheritedElementBinder.nestedProtoView = this.compileAllLoaded(templateCache, ce.componentDirective, null);
              }
            }
            return assert.returnType((rootProtoView), ProtoView);
          }
        }, {});
      }()));
      Object.defineProperty(Compiler, "parameters", {get: function() {
          return [[TemplateLoader], [DirectiveMetadataReader], [Parser], [CompilerCache]];
        }});
      Object.defineProperty(Compiler.prototype.createSteps, "parameters", {get: function() {
          return [[DirectiveMetadata]];
        }});
      Object.defineProperty(Compiler.prototype.compile, "parameters", {get: function() {
          return [[Type], [Element]];
        }});
      Object.defineProperty(Compiler.prototype.compileAllLoaded, "parameters", {get: function() {
          return [[], [DirectiveMetadata], [Element]];
        }});
    }
  };
});




System.register("core/compiler/directive_metadata", ["rtts_assert/rtts_assert", "facade/lang", "../annotations/annotations", "facade/collection", "./shadow_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/directive_metadata";
  var assert,
      Type,
      Directive,
      List,
      ShadowDomStrategy,
      DirectiveMetadata;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Type = m.Type;
    }, function(m) {
      Directive = m.Directive;
    }, function(m) {
      List = m.List;
    }, function(m) {
      ShadowDomStrategy = m.ShadowDomStrategy;
    }],
    execute: function() {
      DirectiveMetadata = $__export("DirectiveMetadata", (function() {
        var DirectiveMetadata = function DirectiveMetadata(type, annotation, shadowDomStrategy, componentDirectives) {
          assert.argumentTypes(type, Type, annotation, Directive, shadowDomStrategy, ShadowDomStrategy, componentDirectives, List);
          this.annotation = annotation;
          this.type = type;
          this.shadowDomStrategy = shadowDomStrategy;
          this.componentDirectives = componentDirectives;
        };
        return ($traceurRuntime.createClass)(DirectiveMetadata, {}, {});
      }()));
      Object.defineProperty(DirectiveMetadata, "parameters", {get: function() {
          return [[Type], [Directive], [ShadowDomStrategy], [List]];
        }});
    }
  };
});




System.register("core/compiler/directive_metadata_reader", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "../annotations/annotations", "./directive_metadata", "reflection/reflection", "./shadow_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/directive_metadata_reader";
  var assert,
      Type,
      isPresent,
      BaseException,
      stringify,
      List,
      ListWrapper,
      Directive,
      Component,
      DirectiveMetadata,
      reflector,
      ShadowDom,
      ShadowDomStrategy,
      ShadowDomNative,
      DirectiveMetadataReader;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Type = m.Type;
      isPresent = m.isPresent;
      BaseException = m.BaseException;
      stringify = m.stringify;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      Directive = m.Directive;
      Component = m.Component;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      reflector = m.reflector;
    }, function(m) {
      ShadowDom = m.ShadowDom;
      ShadowDomStrategy = m.ShadowDomStrategy;
      ShadowDomNative = m.ShadowDomNative;
    }],
    execute: function() {
      DirectiveMetadataReader = $__export("DirectiveMetadataReader", (function() {
        var DirectiveMetadataReader = function DirectiveMetadataReader() {};
        return ($traceurRuntime.createClass)(DirectiveMetadataReader, {
          read: function(type) {
            assert.argumentTypes(type, Type);
            var annotations = reflector.annotations(type);
            if (isPresent(annotations)) {
              for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof Component) {
                  var shadowDomStrategy = this.parseShadowDomStrategy(annotation);
                  return assert.returnType((new DirectiveMetadata(type, annotation, shadowDomStrategy, this.componentDirectivesMetadata(annotation, shadowDomStrategy))), DirectiveMetadata);
                }
                if (annotation instanceof Directive) {
                  return assert.returnType((new DirectiveMetadata(type, annotation, null, null)), DirectiveMetadata);
                }
              }
            }
            throw new BaseException(("No Directive annotation found on " + stringify(type)));
          },
          parseShadowDomStrategy: function(annotation) {
            assert.argumentTypes(annotation, Component);
            return assert.returnType((isPresent(annotation.shadowDom) ? annotation.shadowDom : ShadowDomNative), ShadowDomStrategy);
          },
          componentDirectivesMetadata: function(annotation, shadowDomStrategy) {
            assert.argumentTypes(annotation, Component, shadowDomStrategy, ShadowDomStrategy);
            var polyDirs = shadowDomStrategy.polyfillDirectives();
            var template = annotation.template;
            var templateDirs = isPresent(template) && isPresent(template.directives) ? template.directives : [];
            var res = [];
            res = ListWrapper.concat(res, templateDirs);
            res = ListWrapper.concat(res, polyDirs);
            return assert.returnType((res), List);
          }
        }, {});
      }()));
      Object.defineProperty(DirectiveMetadataReader.prototype.read, "parameters", {get: function() {
          return [[Type]];
        }});
      Object.defineProperty(DirectiveMetadataReader.prototype.parseShadowDomStrategy, "parameters", {get: function() {
          return [[Component]];
        }});
      Object.defineProperty(DirectiveMetadataReader.prototype.componentDirectivesMetadata, "parameters", {get: function() {
          return [[Component], [ShadowDomStrategy]];
        }});
    }
  };
});




System.register("core/compiler/element_binder", ["rtts_assert/rtts_assert", "./element_injector", "facade/lang", "facade/collection", "./directive_metadata", "./view"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/element_binder";
  var assert,
      ProtoElementInjector,
      FIELD,
      MapWrapper,
      DirectiveMetadata,
      List,
      Map,
      ProtoView,
      ElementBinder;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      ProtoElementInjector = m.ProtoElementInjector;
    }, function(m) {
      FIELD = m.FIELD;
    }, function(m) {
      MapWrapper = m.MapWrapper;
      List = m.List;
      Map = m.Map;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      ProtoView = m.ProtoView;
    }],
    execute: function() {
      ElementBinder = $__export("ElementBinder", (function() {
        var ElementBinder = function ElementBinder(protoElementInjector, componentDirective, templateDirective) {
          assert.argumentTypes(protoElementInjector, ProtoElementInjector, componentDirective, DirectiveMetadata, templateDirective, DirectiveMetadata);
          this.protoElementInjector = protoElementInjector;
          this.componentDirective = componentDirective;
          this.templateDirective = templateDirective;
          this.events = null;
          this.textNodeIndices = null;
          this.hasElementPropertyBindings = false;
          this.nestedProtoView = null;
        };
        return ($traceurRuntime.createClass)(ElementBinder, {}, {});
      }()));
      Object.defineProperty(ElementBinder, "parameters", {get: function() {
          return [[ProtoElementInjector], [DirectiveMetadata], [DirectiveMetadata]];
        }});
    }
  };
});




System.register("core/compiler/element_injector", ["rtts_assert/rtts_assert", "facade/lang", "facade/math", "facade/collection", "di/di", "core/annotations/visibility", "core/annotations/events", "core/annotations/annotations", "core/compiler/view", "core/compiler/shadow_dom_emulation/light_dom", "core/compiler/viewport", "core/dom/element"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/element_injector";
  var assert,
      FIELD,
      isPresent,
      isBlank,
      Type,
      int,
      BaseException,
      Math,
      List,
      ListWrapper,
      MapWrapper,
      Injector,
      Key,
      Dependency,
      bind,
      Binding,
      NoProviderError,
      ProviderError,
      CyclicDependencyError,
      Parent,
      Ancestor,
      EventEmitter,
      onDestroy,
      View,
      ProtoView,
      LightDom,
      SourceLightDom,
      DestinationLightDom,
      ViewPort,
      NgElement,
      Directive,
      _MAX_DIRECTIVE_CONSTRUCTION_COUNTER,
      MAX_DEPTH,
      _undefined,
      _staticKeys,
      StaticKeys,
      TreeNode,
      DirectiveDependency,
      DirectiveBinding,
      PreBuiltObjects,
      ProtoElementInjector,
      ElementInjector,
      OutOfBoundsAccess;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      FIELD = m.FIELD;
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      Type = m.Type;
      int = m.int;
      BaseException = m.BaseException;
    }, function(m) {
      Math = m.Math;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      Injector = m.Injector;
      Key = m.Key;
      Dependency = m.Dependency;
      bind = m.bind;
      Binding = m.Binding;
      NoProviderError = m.NoProviderError;
      ProviderError = m.ProviderError;
      CyclicDependencyError = m.CyclicDependencyError;
    }, function(m) {
      Parent = m.Parent;
      Ancestor = m.Ancestor;
    }, function(m) {
      EventEmitter = m.EventEmitter;
    }, function(m) {
      onDestroy = m.onDestroy;
      Directive = m.Directive;
    }, function(m) {
      View = m.View;
      ProtoView = m.ProtoView;
    }, function(m) {
      LightDom = m.LightDom;
      SourceLightDom = m.SourceLightDom;
      DestinationLightDom = m.DestinationLightDom;
    }, function(m) {
      ViewPort = m.ViewPort;
    }, function(m) {
      NgElement = m.NgElement;
    }],
    execute: function() {
      _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;
      MAX_DEPTH = Math.pow(2, 30) - 1;
      _undefined = new Object();
      StaticKeys = (function() {
        var StaticKeys = function StaticKeys() {
          this.viewId = Key.get(View).id;
          this.ngElementId = Key.get(NgElement).id;
          this.viewPortId = Key.get(ViewPort).id;
          this.destinationLightDomId = Key.get(DestinationLightDom).id;
          this.sourceLightDomId = Key.get(SourceLightDom).id;
        };
        return ($traceurRuntime.createClass)(StaticKeys, {}, {instance: function() {
            if (isBlank(_staticKeys))
              _staticKeys = new StaticKeys();
            return _staticKeys;
          }});
      }());
      TreeNode = (function() {
        var TreeNode = function TreeNode(parent) {
          assert.argumentTypes(parent, TreeNode);
          this._parent = parent;
          this._head = null;
          this._tail = null;
          this._next = null;
          this._prev = null;
          if (isPresent(parent))
            parent._addChild(this);
        };
        return ($traceurRuntime.createClass)(TreeNode, {
          _addChild: function(child) {
            assert.argumentTypes(child, TreeNode);
            if (isPresent(this._tail)) {
              this._tail._next = child;
              child._prev = this._tail;
              this._tail = child;
            } else {
              this._tail = this._head = child;
            }
          },
          get parent() {
            return this._parent;
          },
          set parent(node) {
            assert.argumentTypes(node, TreeNode);
            this._parent = node;
          },
          get children() {
            var res = [];
            var child = this._head;
            while (child != null) {
              ListWrapper.push(res, child);
              child = child._next;
            }
            return res;
          }
        }, {});
      }());
      Object.defineProperty(TreeNode, "parameters", {get: function() {
          return [[TreeNode]];
        }});
      Object.defineProperty(TreeNode.prototype._addChild, "parameters", {get: function() {
          return [[TreeNode]];
        }});
      Object.defineProperty(Object.getOwnPropertyDescriptor(TreeNode.prototype, "parent").set, "parameters", {get: function() {
          return [[TreeNode]];
        }});
      DirectiveDependency = $__export("DirectiveDependency", (function($__super) {
        var DirectiveDependency = function DirectiveDependency(key, asPromise, lazy, properties, depth, eventEmitterName) {
          assert.argumentTypes(key, Key, asPromise, $traceurRuntime.type.boolean, lazy, $traceurRuntime.type.boolean, properties, List, depth, int, eventEmitterName, $traceurRuntime.type.string);
          $traceurRuntime.superConstructor(DirectiveDependency).call(this, key, asPromise, lazy, properties);
          this.depth = depth;
          this.eventEmitterName = eventEmitterName;
        };
        return ($traceurRuntime.createClass)(DirectiveDependency, {}, {
          createFrom: function(d) {
            assert.argumentTypes(d, Dependency);
            return assert.returnType((new DirectiveDependency(d.key, d.asPromise, d.lazy, d.properties, DirectiveDependency._depth(d.properties), DirectiveDependency._eventEmitterName(d.properties))), Dependency);
          },
          _depth: function(properties) {
            if (properties.length == 0)
              return assert.returnType((0), int);
            if (ListWrapper.any(properties, (function(p) {
              return p instanceof Parent;
            })))
              return assert.returnType((1), int);
            if (ListWrapper.any(properties, (function(p) {
              return p instanceof Ancestor;
            })))
              return assert.returnType((MAX_DEPTH), int);
            return assert.returnType((0), int);
          },
          _eventEmitterName: function(properties) {
            for (var i = 0; i < properties.length; i++) {
              if (properties[i] instanceof EventEmitter) {
                return assert.returnType((properties[i].eventName), $traceurRuntime.type.string);
              }
            }
            return assert.returnType((null), $traceurRuntime.type.string);
          }
        }, $__super);
      }(Dependency)));
      Object.defineProperty(DirectiveDependency, "parameters", {get: function() {
          return [[Key], [$traceurRuntime.type.boolean], [$traceurRuntime.type.boolean], [List], [int], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DirectiveDependency.createFrom, "parameters", {get: function() {
          return [[Dependency]];
        }});
      DirectiveBinding = $__export("DirectiveBinding", (function($__super) {
        var DirectiveBinding = function DirectiveBinding(key, factory, dependencies, providedAsPromise, callOnDestroy) {
          assert.argumentTypes(key, Key, factory, Function, dependencies, List, providedAsPromise, $traceurRuntime.type.boolean, callOnDestroy, $traceurRuntime.type.boolean);
          $traceurRuntime.superConstructor(DirectiveBinding).call(this, key, factory, dependencies, providedAsPromise);
          this.callOnDestroy = callOnDestroy;
        };
        return ($traceurRuntime.createClass)(DirectiveBinding, {}, {
          createFromBinding: function(b, annotation) {
            assert.argumentTypes(b, Binding, annotation, Directive);
            var deps = ListWrapper.map(b.dependencies, DirectiveDependency.createFrom);
            var callOnDestroy = isPresent(annotation) && isPresent(annotation.lifecycle) ? ListWrapper.contains(annotation.lifecycle, onDestroy) : false;
            return assert.returnType((new DirectiveBinding(b.key, b.factory, deps, b.providedAsPromise, callOnDestroy)), Binding);
          },
          createFromType: function(type, annotation) {
            assert.argumentTypes(type, Type, annotation, Directive);
            var binding = bind(type).toClass(type);
            return assert.returnType((DirectiveBinding.createFromBinding(binding, annotation)), Binding);
          },
          _hasEventEmitter: function(eventName, binding) {
            return ListWrapper.any(binding.dependencies, (function(d) {
              return (d.eventEmitterName == eventName);
            }));
          }
        }, $__super);
      }(Binding)));
      Object.defineProperty(DirectiveBinding, "parameters", {get: function() {
          return [[Key], [Function], [List], [$traceurRuntime.type.boolean], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(DirectiveBinding.createFromBinding, "parameters", {get: function() {
          return [[Binding], [Directive]];
        }});
      Object.defineProperty(DirectiveBinding.createFromType, "parameters", {get: function() {
          return [[Type], [Directive]];
        }});
      Object.defineProperty(DirectiveBinding._hasEventEmitter, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [DirectiveBinding]];
        }});
      PreBuiltObjects = $__export("PreBuiltObjects", (function() {
        var PreBuiltObjects = function PreBuiltObjects(view, element, viewPort, lightDom) {
          assert.argumentTypes(view, $traceurRuntime.type.any, element, NgElement, viewPort, ViewPort, lightDom, LightDom);
          this.view = view;
          this.element = element;
          this.viewPort = viewPort;
          this.lightDom = lightDom;
        };
        return ($traceurRuntime.createClass)(PreBuiltObjects, {}, {});
      }()));
      Object.defineProperty(PreBuiltObjects, "parameters", {get: function() {
          return [[], [NgElement], [ViewPort], [LightDom]];
        }});
      ProtoElementInjector = $__export("ProtoElementInjector", (function() {
        var ProtoElementInjector = function ProtoElementInjector(parent, index, bindings) {
          var firstBindingIsComponent = arguments[3] !== (void 0) ? arguments[3] : false;
          var distanceToParent = arguments[4] !== (void 0) ? arguments[4] : 0;
          assert.argumentTypes(parent, ProtoElementInjector, index, int, bindings, List, firstBindingIsComponent, $traceurRuntime.type.boolean, distanceToParent, $traceurRuntime.type.number);
          this.parent = parent;
          this.index = index;
          this.distanceToParent = distanceToParent;
          this._binding0IsComponent = firstBindingIsComponent;
          this._binding0 = null;
          this._keyId0 = null;
          this._binding1 = null;
          this._keyId1 = null;
          this._binding2 = null;
          this._keyId2 = null;
          this._binding3 = null;
          this._keyId3 = null;
          this._binding4 = null;
          this._keyId4 = null;
          this._binding5 = null;
          this._keyId5 = null;
          this._binding6 = null;
          this._keyId6 = null;
          this._binding7 = null;
          this._keyId7 = null;
          this._binding8 = null;
          this._keyId8 = null;
          this._binding9 = null;
          this._keyId9 = null;
          var length = bindings.length;
          if (length > 0) {
            this._binding0 = this._createBinding(bindings[0]);
            this._keyId0 = this._binding0.key.id;
          }
          if (length > 1) {
            this._binding1 = this._createBinding(bindings[1]);
            this._keyId1 = this._binding1.key.id;
          }
          if (length > 2) {
            this._binding2 = this._createBinding(bindings[2]);
            this._keyId2 = this._binding2.key.id;
          }
          if (length > 3) {
            this._binding3 = this._createBinding(bindings[3]);
            this._keyId3 = this._binding3.key.id;
          }
          if (length > 4) {
            this._binding4 = this._createBinding(bindings[4]);
            this._keyId4 = this._binding4.key.id;
          }
          if (length > 5) {
            this._binding5 = this._createBinding(bindings[5]);
            this._keyId5 = this._binding5.key.id;
          }
          if (length > 6) {
            this._binding6 = this._createBinding(bindings[6]);
            this._keyId6 = this._binding6.key.id;
          }
          if (length > 7) {
            this._binding7 = this._createBinding(bindings[7]);
            this._keyId7 = this._binding7.key.id;
          }
          if (length > 8) {
            this._binding8 = this._createBinding(bindings[8]);
            this._keyId8 = this._binding8.key.id;
          }
          if (length > 9) {
            this._binding9 = this._createBinding(bindings[9]);
            this._keyId9 = this._binding9.key.id;
          }
          if (length > 10) {
            throw 'Maximum number of directives per element has been reached.';
          }
        };
        return ($traceurRuntime.createClass)(ProtoElementInjector, {
          instantiate: function(parent, host, eventCallbacks) {
            assert.argumentTypes(parent, ElementInjector, host, ElementInjector, eventCallbacks, $traceurRuntime.type.any);
            return assert.returnType((new ElementInjector(this, parent, host, eventCallbacks)), ElementInjector);
          },
          _createBinding: function(bindingOrType) {
            if (bindingOrType instanceof DirectiveBinding) {
              return bindingOrType;
            } else {
              var b = bind(bindingOrType).toClass(bindingOrType);
              return DirectiveBinding.createFromBinding(b, null);
            }
          },
          get hasBindings() {
            return assert.returnType((isPresent(this._binding0)), $traceurRuntime.type.boolean);
          },
          hasEventEmitter: function(eventName) {
            assert.argumentTypes(eventName, $traceurRuntime.type.string);
            var p = this;
            if (isPresent(p._binding0) && DirectiveBinding._hasEventEmitter(eventName, p._binding0))
              return true;
            if (isPresent(p._binding1) && DirectiveBinding._hasEventEmitter(eventName, p._binding1))
              return true;
            if (isPresent(p._binding2) && DirectiveBinding._hasEventEmitter(eventName, p._binding2))
              return true;
            if (isPresent(p._binding3) && DirectiveBinding._hasEventEmitter(eventName, p._binding3))
              return true;
            if (isPresent(p._binding4) && DirectiveBinding._hasEventEmitter(eventName, p._binding4))
              return true;
            if (isPresent(p._binding5) && DirectiveBinding._hasEventEmitter(eventName, p._binding5))
              return true;
            if (isPresent(p._binding6) && DirectiveBinding._hasEventEmitter(eventName, p._binding6))
              return true;
            if (isPresent(p._binding7) && DirectiveBinding._hasEventEmitter(eventName, p._binding7))
              return true;
            if (isPresent(p._binding8) && DirectiveBinding._hasEventEmitter(eventName, p._binding8))
              return true;
            if (isPresent(p._binding9) && DirectiveBinding._hasEventEmitter(eventName, p._binding9))
              return true;
            return false;
          }
        }, {});
      }()));
      Object.defineProperty(ProtoElementInjector, "parameters", {get: function() {
          return [[ProtoElementInjector], [int], [List], [$traceurRuntime.type.boolean], [$traceurRuntime.type.number]];
        }});
      Object.defineProperty(ProtoElementInjector.prototype.instantiate, "parameters", {get: function() {
          return [[ElementInjector], [ElementInjector], []];
        }});
      Object.defineProperty(ProtoElementInjector.prototype.hasEventEmitter, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      ElementInjector = $__export("ElementInjector", (function($__super) {
        var ElementInjector = function ElementInjector(proto, parent, host, eventCallbacks) {
          assert.argumentTypes(proto, ProtoElementInjector, parent, ElementInjector, host, ElementInjector, eventCallbacks, Map);
          $traceurRuntime.superConstructor(ElementInjector).call(this, parent);
          if (isPresent(parent) && isPresent(host)) {
            throw new BaseException('Only either parent or host is allowed');
          }
          this._host = null;
          if (isPresent(parent)) {
            this._host = parent._host;
          } else {
            this._host = host;
          }
          this._proto = proto;
          this._preBuiltObjects = null;
          this._lightDomAppInjector = null;
          this._shadowDomAppInjector = null;
          this._eventCallbacks = eventCallbacks;
          this._obj0 = null;
          this._obj1 = null;
          this._obj2 = null;
          this._obj3 = null;
          this._obj4 = null;
          this._obj5 = null;
          this._obj6 = null;
          this._obj7 = null;
          this._obj8 = null;
          this._obj9 = null;
          this._constructionCounter = 0;
        };
        return ($traceurRuntime.createClass)(ElementInjector, {
          clearDirectives: function() {
            this._preBuiltObjects = null;
            this._lightDomAppInjector = null;
            this._shadowDomAppInjector = null;
            var p = this._proto;
            if (isPresent(p._binding0) && p._binding0.callOnDestroy) {
              this._obj0.onDestroy();
            }
            if (isPresent(p._binding1) && p._binding1.callOnDestroy) {
              this._obj1.onDestroy();
            }
            if (isPresent(p._binding2) && p._binding2.callOnDestroy) {
              this._obj2.onDestroy();
            }
            if (isPresent(p._binding3) && p._binding3.callOnDestroy) {
              this._obj3.onDestroy();
            }
            if (isPresent(p._binding4) && p._binding4.callOnDestroy) {
              this._obj4.onDestroy();
            }
            if (isPresent(p._binding5) && p._binding5.callOnDestroy) {
              this._obj5.onDestroy();
            }
            if (isPresent(p._binding6) && p._binding6.callOnDestroy) {
              this._obj6.onDestroy();
            }
            if (isPresent(p._binding7) && p._binding7.callOnDestroy) {
              this._obj7.onDestroy();
            }
            if (isPresent(p._binding8) && p._binding8.callOnDestroy) {
              this._obj8.onDestroy();
            }
            if (isPresent(p._binding9) && p._binding9.callOnDestroy) {
              this._obj9.onDestroy();
            }
            this._obj0 = null;
            this._obj1 = null;
            this._obj2 = null;
            this._obj3 = null;
            this._obj4 = null;
            this._obj5 = null;
            this._obj6 = null;
            this._obj7 = null;
            this._obj8 = null;
            this._obj9 = null;
            this._constructionCounter = 0;
          },
          instantiateDirectives: function(lightDomAppInjector, shadowDomAppInjector, preBuiltObjects) {
            assert.argumentTypes(lightDomAppInjector, Injector, shadowDomAppInjector, Injector, preBuiltObjects, PreBuiltObjects);
            this._checkShadowDomAppInjector(shadowDomAppInjector);
            this._preBuiltObjects = preBuiltObjects;
            this._lightDomAppInjector = lightDomAppInjector;
            this._shadowDomAppInjector = shadowDomAppInjector;
            var p = this._proto;
            if (isPresent(p._keyId0))
              this._getDirectiveByKeyId(p._keyId0);
            if (isPresent(p._keyId1))
              this._getDirectiveByKeyId(p._keyId1);
            if (isPresent(p._keyId2))
              this._getDirectiveByKeyId(p._keyId2);
            if (isPresent(p._keyId3))
              this._getDirectiveByKeyId(p._keyId3);
            if (isPresent(p._keyId4))
              this._getDirectiveByKeyId(p._keyId4);
            if (isPresent(p._keyId5))
              this._getDirectiveByKeyId(p._keyId5);
            if (isPresent(p._keyId6))
              this._getDirectiveByKeyId(p._keyId6);
            if (isPresent(p._keyId7))
              this._getDirectiveByKeyId(p._keyId7);
            if (isPresent(p._keyId8))
              this._getDirectiveByKeyId(p._keyId8);
            if (isPresent(p._keyId9))
              this._getDirectiveByKeyId(p._keyId9);
          },
          _checkShadowDomAppInjector: function(shadowDomAppInjector) {
            assert.argumentTypes(shadowDomAppInjector, Injector);
            if (this._proto._binding0IsComponent && isBlank(shadowDomAppInjector)) {
              throw new BaseException('A shadowDomAppInjector is required as this ElementInjector contains a component');
            } else if (!this._proto._binding0IsComponent && isPresent(shadowDomAppInjector)) {
              throw new BaseException('No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
            }
          },
          get: function(token) {
            return this._getByKey(Key.get(token), 0, null);
          },
          hasDirective: function(type) {
            assert.argumentTypes(type, Type);
            return assert.returnType((this._getDirectiveByKeyId(Key.get(type).id) !== _undefined), $traceurRuntime.type.boolean);
          },
          hasPreBuiltObject: function(type) {
            assert.argumentTypes(type, Type);
            var pb = this._getPreBuiltObjectByKeyId(Key.get(type).id);
            return assert.returnType((pb !== _undefined && isPresent(pb)), $traceurRuntime.type.boolean);
          },
          forElement: function(el) {
            return assert.returnType((this._preBuiltObjects.element.domElement === el), $traceurRuntime.type.boolean);
          },
          getComponent: function() {
            if (this._proto._binding0IsComponent) {
              return this._obj0;
            } else {
              throw new BaseException('There is not component stored in this ElementInjector');
            }
          },
          directParent: function() {
            return assert.returnType((this._proto.distanceToParent < 2 ? this.parent : null), ElementInjector);
          },
          _isComponentKey: function(key) {
            assert.argumentTypes(key, Key);
            return this._proto._binding0IsComponent && key.id === this._proto._keyId0;
          },
          _new: function(binding) {
            assert.argumentTypes(binding, Binding);
            if (this._constructionCounter++ > _MAX_DIRECTIVE_CONSTRUCTION_COUNTER) {
              throw new CyclicDependencyError(binding.key);
            }
            var factory = binding.factory;
            var deps = binding.dependencies;
            var length = deps.length;
            var d0,
                d1,
                d2,
                d3,
                d4,
                d5,
                d6,
                d7,
                d8,
                d9;
            try {
              d0 = length > 0 ? this._getByDependency(deps[0], binding.key) : null;
              d1 = length > 1 ? this._getByDependency(deps[1], binding.key) : null;
              d2 = length > 2 ? this._getByDependency(deps[2], binding.key) : null;
              d3 = length > 3 ? this._getByDependency(deps[3], binding.key) : null;
              d4 = length > 4 ? this._getByDependency(deps[4], binding.key) : null;
              d5 = length > 5 ? this._getByDependency(deps[5], binding.key) : null;
              d6 = length > 6 ? this._getByDependency(deps[6], binding.key) : null;
              d7 = length > 7 ? this._getByDependency(deps[7], binding.key) : null;
              d8 = length > 8 ? this._getByDependency(deps[8], binding.key) : null;
              d9 = length > 9 ? this._getByDependency(deps[9], binding.key) : null;
            } catch (e) {
              if (e instanceof ProviderError)
                e.addKey(binding.key);
              throw e;
            }
            var obj;
            switch (length) {
              case 0:
                obj = factory();
                break;
              case 1:
                obj = factory(d0);
                break;
              case 2:
                obj = factory(d0, d1);
                break;
              case 3:
                obj = factory(d0, d1, d2);
                break;
              case 4:
                obj = factory(d0, d1, d2, d3);
                break;
              case 5:
                obj = factory(d0, d1, d2, d3, d4);
                break;
              case 6:
                obj = factory(d0, d1, d2, d3, d4, d5);
                break;
              case 7:
                obj = factory(d0, d1, d2, d3, d4, d5, d6);
                break;
              case 8:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                break;
              case 9:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                break;
              case 10:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                break;
              default:
                throw ("Directive " + binding.key.token + " can only have up to 10 dependencies.");
            }
            return obj;
          },
          _getByDependency: function(dep, requestor) {
            assert.argumentTypes(dep, DirectiveDependency, requestor, Key);
            if (isPresent(dep.eventEmitterName))
              return this._buildEventEmitter(dep);
            return this._getByKey(dep.key, dep.depth, requestor);
          },
          _buildEventEmitter: function(dep) {
            var view = this._getPreBuiltObjectByKeyId(StaticKeys.instance().viewId);
            if (isPresent(this._eventCallbacks)) {
              var callback = MapWrapper.get(this._eventCallbacks, dep.eventEmitterName);
              if (isPresent(callback)) {
                var locals = MapWrapper.create();
                return ProtoView.buildInnerCallback(callback, view, locals);
              }
            }
            return (function(_) {});
          },
          _getByKey: function(key, depth, requestor) {
            assert.argumentTypes(key, Key, depth, $traceurRuntime.type.number, requestor, Key);
            var ei = this;
            if (!this._shouldIncludeSelf(depth)) {
              depth -= ei._proto.distanceToParent;
              ei = ei._parent;
            }
            while (ei != null && depth >= 0) {
              var preBuiltObj = ei._getPreBuiltObjectByKeyId(key.id);
              if (preBuiltObj !== _undefined)
                return preBuiltObj;
              var dir = ei._getDirectiveByKeyId(key.id);
              if (dir !== _undefined)
                return dir;
              depth -= ei._proto.distanceToParent;
              ei = ei._parent;
            }
            if (isPresent(this._host) && this._host._isComponentKey(key)) {
              return this._host.getComponent();
            } else {
              return this._appInjector(requestor).get(key);
            }
          },
          _appInjector: function(requestor) {
            assert.argumentTypes(requestor, Key);
            if (isPresent(requestor) && this._isComponentKey(requestor)) {
              return this._shadowDomAppInjector;
            } else {
              return this._lightDomAppInjector;
            }
          },
          _shouldIncludeSelf: function(depth) {
            assert.argumentTypes(depth, int);
            return depth === 0;
          },
          _getPreBuiltObjectByKeyId: function(keyId) {
            assert.argumentTypes(keyId, int);
            var staticKeys = StaticKeys.instance();
            if (keyId === staticKeys.viewId)
              return this._preBuiltObjects.view;
            if (keyId === staticKeys.ngElementId)
              return this._preBuiltObjects.element;
            if (keyId === staticKeys.viewPortId)
              return this._preBuiltObjects.viewPort;
            if (keyId === staticKeys.destinationLightDomId) {
              var p = assert.type(this.directParent(), ElementInjector);
              return isPresent(p) ? p._preBuiltObjects.lightDom : null;
            }
            if (keyId === staticKeys.sourceLightDomId) {
              return this._host._preBuiltObjects.lightDom;
            }
            return _undefined;
          },
          _getDirectiveByKeyId: function(keyId) {
            assert.argumentTypes(keyId, int);
            var p = this._proto;
            if (p._keyId0 === keyId) {
              if (isBlank(this._obj0)) {
                this._obj0 = this._new(p._binding0);
              }
              return this._obj0;
            }
            if (p._keyId1 === keyId) {
              if (isBlank(this._obj1)) {
                this._obj1 = this._new(p._binding1);
              }
              return this._obj1;
            }
            if (p._keyId2 === keyId) {
              if (isBlank(this._obj2)) {
                this._obj2 = this._new(p._binding2);
              }
              return this._obj2;
            }
            if (p._keyId3 === keyId) {
              if (isBlank(this._obj3)) {
                this._obj3 = this._new(p._binding3);
              }
              return this._obj3;
            }
            if (p._keyId4 === keyId) {
              if (isBlank(this._obj4)) {
                this._obj4 = this._new(p._binding4);
              }
              return this._obj4;
            }
            if (p._keyId5 === keyId) {
              if (isBlank(this._obj5)) {
                this._obj5 = this._new(p._binding5);
              }
              return this._obj5;
            }
            if (p._keyId6 === keyId) {
              if (isBlank(this._obj6)) {
                this._obj6 = this._new(p._binding6);
              }
              return this._obj6;
            }
            if (p._keyId7 === keyId) {
              if (isBlank(this._obj7)) {
                this._obj7 = this._new(p._binding7);
              }
              return this._obj7;
            }
            if (p._keyId8 === keyId) {
              if (isBlank(this._obj8)) {
                this._obj8 = this._new(p._binding8);
              }
              return this._obj8;
            }
            if (p._keyId9 === keyId) {
              if (isBlank(this._obj9)) {
                this._obj9 = this._new(p._binding9);
              }
              return this._obj9;
            }
            return _undefined;
          },
          getAtIndex: function(index) {
            assert.argumentTypes(index, int);
            if (index == 0)
              return this._obj0;
            if (index == 1)
              return this._obj1;
            if (index == 2)
              return this._obj2;
            if (index == 3)
              return this._obj3;
            if (index == 4)
              return this._obj4;
            if (index == 5)
              return this._obj5;
            if (index == 6)
              return this._obj6;
            if (index == 7)
              return this._obj7;
            if (index == 8)
              return this._obj8;
            if (index == 9)
              return this._obj9;
            throw new OutOfBoundsAccess(index);
          },
          hasInstances: function() {
            return this._constructionCounter > 0;
          },
          hasEventEmitter: function(eventName) {
            assert.argumentTypes(eventName, $traceurRuntime.type.string);
            return this._proto.hasEventEmitter(eventName);
          }
        }, {}, $__super);
      }(TreeNode)));
      Object.defineProperty(ElementInjector, "parameters", {get: function() {
          return [[ProtoElementInjector], [ElementInjector], [ElementInjector], [Map]];
        }});
      Object.defineProperty(ElementInjector.prototype.instantiateDirectives, "parameters", {get: function() {
          return [[Injector], [Injector], [PreBuiltObjects]];
        }});
      Object.defineProperty(ElementInjector.prototype._checkShadowDomAppInjector, "parameters", {get: function() {
          return [[Injector]];
        }});
      Object.defineProperty(ElementInjector.prototype.hasDirective, "parameters", {get: function() {
          return [[Type]];
        }});
      Object.defineProperty(ElementInjector.prototype.hasPreBuiltObject, "parameters", {get: function() {
          return [[Type]];
        }});
      Object.defineProperty(ElementInjector.prototype._isComponentKey, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(ElementInjector.prototype._new, "parameters", {get: function() {
          return [[Binding]];
        }});
      Object.defineProperty(ElementInjector.prototype._getByDependency, "parameters", {get: function() {
          return [[DirectiveDependency], [Key]];
        }});
      Object.defineProperty(ElementInjector.prototype._getByKey, "parameters", {get: function() {
          return [[Key], [$traceurRuntime.type.number], [Key]];
        }});
      Object.defineProperty(ElementInjector.prototype._appInjector, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(ElementInjector.prototype._shouldIncludeSelf, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(ElementInjector.prototype._getPreBuiltObjectByKeyId, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(ElementInjector.prototype._getDirectiveByKeyId, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(ElementInjector.prototype.getAtIndex, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(ElementInjector.prototype.hasEventEmitter, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      OutOfBoundsAccess = (function($__super) {
        var OutOfBoundsAccess = function OutOfBoundsAccess(index) {
          this.message = ("Index " + index + " is out-of-bounds.");
        };
        return ($traceurRuntime.createClass)(OutOfBoundsAccess, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(Error));
    }
  };
});




System.register("core/compiler/interfaces", [], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/interfaces";
  var OnChange;
  return {
    setters: [],
    execute: function() {
      OnChange = $__export("OnChange", (function() {
        var OnChange = function OnChange() {};
        return ($traceurRuntime.createClass)(OnChange, {onChange: function(changes) {
            throw "OnChange.onChange is not implemented";
          }}, {});
      }()));
    }
  };
});




System.register("core/compiler/selector", ["rtts_assert/rtts_assert", "facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/selector";
  var assert,
      List,
      Map,
      ListWrapper,
      MapWrapper,
      isPresent,
      isBlank,
      RegExpWrapper,
      RegExpMatcherWrapper,
      StringWrapper,
      _EMPTY_ATTR_VALUE,
      _SELECTOR_REGEXP,
      CssSelector,
      SelectorMatcher;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      List = m.List;
      Map = m.Map;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      RegExpWrapper = m.RegExpWrapper;
      RegExpMatcherWrapper = m.RegExpMatcherWrapper;
      StringWrapper = m.StringWrapper;
    }],
    execute: function() {
      _EMPTY_ATTR_VALUE = '';
      _SELECTOR_REGEXP = RegExpWrapper.create('^([-\\w]+)|' + '(?:\\.([-\\w]+))|' + '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])');
      CssSelector = $__export("CssSelector", (function() {
        var CssSelector = function CssSelector() {
          this.element = null;
          this.classNames = ListWrapper.create();
          this.attrs = ListWrapper.create();
        };
        return ($traceurRuntime.createClass)(CssSelector, {
          setElement: function() {
            var element = arguments[0] !== (void 0) ? arguments[0] : null;
            assert.argumentTypes(element, $traceurRuntime.type.string);
            if (isPresent(element)) {
              element = element.toLowerCase();
            }
            this.element = element;
          },
          addAttribute: function(name) {
            var value = arguments[1] !== (void 0) ? arguments[1] : _EMPTY_ATTR_VALUE;
            assert.argumentTypes(name, $traceurRuntime.type.string, value, $traceurRuntime.type.string);
            ListWrapper.push(this.attrs, name.toLowerCase());
            if (isPresent(value)) {
              value = value.toLowerCase();
            } else {
              value = _EMPTY_ATTR_VALUE;
            }
            ListWrapper.push(this.attrs, value);
          },
          addClassName: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            ListWrapper.push(this.classNames, name.toLowerCase());
          },
          toString: function() {
            var res = '';
            if (isPresent(this.element)) {
              res += this.element;
            }
            if (isPresent(this.classNames)) {
              for (var i = 0; i < this.classNames.length; i++) {
                res += '.' + this.classNames[i];
              }
            }
            if (isPresent(this.attrs)) {
              for (var i = 0; i < this.attrs.length; ) {
                var attrName = this.attrs[i++];
                var attrValue = this.attrs[i++];
                res += '[' + attrName;
                if (attrValue.length > 0) {
                  res += '=' + attrValue;
                }
                res += ']';
              }
            }
            return assert.returnType((res), $traceurRuntime.type.string);
          }
        }, {parse: function(selector) {
            assert.argumentTypes(selector, $traceurRuntime.type.string);
            var cssSelector = new CssSelector();
            var matcher = RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
            var match;
            while (isPresent(match = RegExpMatcherWrapper.next(matcher))) {
              if (isPresent(match[1])) {
                cssSelector.setElement(match[1]);
              }
              if (isPresent(match[2])) {
                cssSelector.addClassName(match[2]);
              }
              if (isPresent(match[3])) {
                cssSelector.addAttribute(match[3], match[4]);
              }
            }
            return assert.returnType((cssSelector), CssSelector);
          }});
      }()));
      Object.defineProperty(CssSelector.parse, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(CssSelector.prototype.setElement, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(CssSelector.prototype.addAttribute, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(CssSelector.prototype.addClassName, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      SelectorMatcher = $__export("SelectorMatcher", (function() {
        var SelectorMatcher = function SelectorMatcher() {
          this._selectables = ListWrapper.create();
          this._elementMap = MapWrapper.create();
          this._elementPartialMap = MapWrapper.create();
          this._classMap = MapWrapper.create();
          this._classPartialMap = MapWrapper.create();
          this._attrValueMap = MapWrapper.create();
          this._attrValuePartialMap = MapWrapper.create();
        };
        return ($traceurRuntime.createClass)(SelectorMatcher, {
          addSelectable: function(cssSelector, selectable) {
            assert.argumentTypes(cssSelector, CssSelector, selectable, $traceurRuntime.type.any);
            var matcher = this;
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            if (isPresent(element)) {
              var isTerminal = attrs.length === 0 && classNames.length === 0;
              if (isTerminal) {
                this._addTerminal(matcher._elementMap, element, selectable);
              } else {
                matcher = this._addPartial(matcher._elementPartialMap, element);
              }
            }
            if (isPresent(classNames)) {
              for (var index = 0; index < classNames.length; index++) {
                var isTerminal = attrs.length === 0 && index === classNames.length - 1;
                var className = classNames[index];
                if (isTerminal) {
                  this._addTerminal(matcher._classMap, className, selectable);
                } else {
                  matcher = this._addPartial(matcher._classPartialMap, className);
                }
              }
            }
            if (isPresent(attrs)) {
              for (var index = 0; index < attrs.length; ) {
                var isTerminal = index === attrs.length - 2;
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                var map = isTerminal ? matcher._attrValueMap : matcher._attrValuePartialMap;
                var valuesMap = MapWrapper.get(map, attrName);
                if (isBlank(valuesMap)) {
                  valuesMap = MapWrapper.create();
                  MapWrapper.set(map, attrName, valuesMap);
                }
                if (isTerminal) {
                  this._addTerminal(valuesMap, attrValue, selectable);
                } else {
                  matcher = this._addPartial(valuesMap, attrValue);
                }
              }
            }
          },
          _addTerminal: function(map, name, selectable) {
            assert.argumentTypes(map, Map, name, $traceurRuntime.type.string, selectable, $traceurRuntime.type.any);
            var terminalList = MapWrapper.get(map, name);
            if (isBlank(terminalList)) {
              terminalList = ListWrapper.create();
              MapWrapper.set(map, name, terminalList);
            }
            ListWrapper.push(terminalList, selectable);
          },
          _addPartial: function(map, name) {
            assert.argumentTypes(map, Map, name, $traceurRuntime.type.string);
            var matcher = MapWrapper.get(map, name);
            if (isBlank(matcher)) {
              matcher = new SelectorMatcher();
              MapWrapper.set(map, name, matcher);
            }
            return matcher;
          },
          match: function(cssSelector, matchedCallback) {
            assert.argumentTypes(cssSelector, CssSelector, matchedCallback, Function);
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            this._matchTerminal(this._elementMap, element, matchedCallback);
            this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback);
            if (isPresent(classNames)) {
              for (var index = 0; index < classNames.length; index++) {
                var className = classNames[index];
                this._matchTerminal(this._classMap, className, matchedCallback);
                this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback);
              }
            }
            if (isPresent(attrs)) {
              for (var index = 0; index < attrs.length; ) {
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                var valuesMap = MapWrapper.get(this._attrValueMap, attrName);
                if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                  this._matchTerminal(valuesMap, _EMPTY_ATTR_VALUE, matchedCallback);
                }
                this._matchTerminal(valuesMap, attrValue, matchedCallback);
                valuesMap = MapWrapper.get(this._attrValuePartialMap, attrName);
                this._matchPartial(valuesMap, attrValue, cssSelector, matchedCallback);
              }
            }
          },
          _matchTerminal: function() {
            var map = arguments[0] !== (void 0) ? arguments[0] : null;
            var name = arguments[1];
            var matchedCallback = arguments[2];
            assert.argumentTypes(map, Map, name, $traceurRuntime.type.any, matchedCallback, $traceurRuntime.type.any);
            if (isBlank(map) || isBlank(name)) {
              return ;
            }
            var selectables = MapWrapper.get(map, name);
            if (isBlank(selectables)) {
              return ;
            }
            for (var index = 0; index < selectables.length; index++) {
              matchedCallback(selectables[index]);
            }
          },
          _matchPartial: function() {
            var map = arguments[0] !== (void 0) ? arguments[0] : null;
            var name = arguments[1];
            var cssSelector = arguments[2];
            var matchedCallback = arguments[3];
            assert.argumentTypes(map, Map, name, $traceurRuntime.type.any, cssSelector, $traceurRuntime.type.any, matchedCallback, $traceurRuntime.type.any);
            if (isBlank(map) || isBlank(name)) {
              return ;
            }
            var nestedSelector = MapWrapper.get(map, name);
            if (isBlank(nestedSelector)) {
              return ;
            }
            nestedSelector.match(cssSelector, matchedCallback);
          }
        }, {});
      }()));
      Object.defineProperty(SelectorMatcher.prototype.addSelectable, "parameters", {get: function() {
          return [[CssSelector], []];
        }});
      Object.defineProperty(SelectorMatcher.prototype._addTerminal, "parameters", {get: function() {
          return [[Map], [$traceurRuntime.type.string], []];
        }});
      Object.defineProperty(SelectorMatcher.prototype._addPartial, "parameters", {get: function() {
          return [[Map], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(SelectorMatcher.prototype.match, "parameters", {get: function() {
          return [[CssSelector], [Function]];
        }});
      Object.defineProperty(SelectorMatcher.prototype._matchTerminal, "parameters", {get: function() {
          return [[Map], [], []];
        }});
      Object.defineProperty(SelectorMatcher.prototype._matchPartial, "parameters", {get: function() {
          return [[Map], [], [], []];
        }});
    }
  };
});




System.register("core/compiler/shadow_dom", ["./shadow_dom_strategy"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/shadow_dom";
  var EmulatedShadowDomStrategy,
      NativeShadowDomStrategy,
      ShadowDomEmulated,
      ShadowDomNative;
  var $__exportNames = {
    ShadowDomEmulated: true,
    ShadowDomNative: true
  };
  return {
    setters: [function(m) {
      EmulatedShadowDomStrategy = m.EmulatedShadowDomStrategy;
      NativeShadowDomStrategy = m.NativeShadowDomStrategy;
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }],
    execute: function() {
      ShadowDomEmulated = $__export("ShadowDomEmulated", new EmulatedShadowDomStrategy());
      ShadowDomNative = $__export("ShadowDomNative", new NativeShadowDomStrategy());
    }
  };
});




System.register("core/compiler/shadow_dom_strategy", ["rtts_assert/rtts_assert", "facade/lang", "facade/dom", "facade/collection", "./view", "./shadow_dom_emulation/content_tag", "./shadow_dom_emulation/light_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/shadow_dom_strategy";
  var assert,
      CONST,
      DOM,
      Element,
      List,
      View,
      Content,
      LightDom,
      ShadowDomStrategy,
      EmulatedShadowDomStrategy,
      NativeShadowDomStrategy;
  function moveViewNodesIntoParent(parent, view) {
    for (var i = 0; i < view.nodes.length; ++i) {
      DOM.appendChild(parent, view.nodes[i]);
    }
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      CONST = m.CONST;
    }, function(m) {
      DOM = m.DOM;
      Element = m.Element;
    }, function(m) {
      List = m.List;
    }, function(m) {
      View = m.View;
    }, function(m) {
      Content = m.Content;
    }, function(m) {
      LightDom = m.LightDom;
    }],
    execute: function() {
      ShadowDomStrategy = $__export("ShadowDomStrategy", (function() {
        var ShadowDomStrategy = function ShadowDomStrategy() {};
        return ($traceurRuntime.createClass)(ShadowDomStrategy, {
          attachTemplate: function(el, view) {
            assert.argumentTypes(el, Element, view, View);
          },
          constructLightDom: function(lightDomView, shadowDomView, el) {
            assert.argumentTypes(lightDomView, View, shadowDomView, View, el, Element);
          },
          polyfillDirectives: function() {
            return assert.returnType((null), List);
          }
        }, {});
      }()));
      Object.defineProperty(ShadowDomStrategy, "annotations", {get: function() {
          return [new CONST()];
        }});
      Object.defineProperty(ShadowDomStrategy.prototype.attachTemplate, "parameters", {get: function() {
          return [[Element], [View]];
        }});
      Object.defineProperty(ShadowDomStrategy.prototype.constructLightDom, "parameters", {get: function() {
          return [[View], [View], [Element]];
        }});
      EmulatedShadowDomStrategy = $__export("EmulatedShadowDomStrategy", (function($__super) {
        var EmulatedShadowDomStrategy = function EmulatedShadowDomStrategy() {};
        return ($traceurRuntime.createClass)(EmulatedShadowDomStrategy, {
          attachTemplate: function(el, view) {
            assert.argumentTypes(el, Element, view, View);
            DOM.clearNodes(el);
            moveViewNodesIntoParent(el, view);
          },
          constructLightDom: function(lightDomView, shadowDomView, el) {
            assert.argumentTypes(lightDomView, View, shadowDomView, View, el, Element);
            return new LightDom(lightDomView, shadowDomView, el);
          },
          polyfillDirectives: function() {
            return assert.returnType(([Content]), List);
          }
        }, {}, $__super);
      }(ShadowDomStrategy)));
      Object.defineProperty(EmulatedShadowDomStrategy, "annotations", {get: function() {
          return [new CONST()];
        }});
      Object.defineProperty(EmulatedShadowDomStrategy.prototype.attachTemplate, "parameters", {get: function() {
          return [[Element], [View]];
        }});
      Object.defineProperty(EmulatedShadowDomStrategy.prototype.constructLightDom, "parameters", {get: function() {
          return [[View], [View], [Element]];
        }});
      NativeShadowDomStrategy = $__export("NativeShadowDomStrategy", (function($__super) {
        var NativeShadowDomStrategy = function NativeShadowDomStrategy() {};
        return ($traceurRuntime.createClass)(NativeShadowDomStrategy, {
          attachTemplate: function(el, view) {
            assert.argumentTypes(el, Element, view, View);
            moveViewNodesIntoParent(el.createShadowRoot(), view);
          },
          constructLightDom: function(lightDomView, shadowDomView, el) {
            assert.argumentTypes(lightDomView, View, shadowDomView, View, el, Element);
            return null;
          },
          polyfillDirectives: function() {
            return assert.returnType(([]), List);
          }
        }, {}, $__super);
      }(ShadowDomStrategy)));
      Object.defineProperty(NativeShadowDomStrategy, "annotations", {get: function() {
          return [new CONST()];
        }});
      Object.defineProperty(NativeShadowDomStrategy.prototype.attachTemplate, "parameters", {get: function() {
          return [[Element], [View]];
        }});
      Object.defineProperty(NativeShadowDomStrategy.prototype.constructLightDom, "parameters", {get: function() {
          return [[View], [View], [Element]];
        }});
    }
  };
});




System.register("core/compiler/template_loader", ["rtts_assert/rtts_assert", "facade/async"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/template_loader";
  var assert,
      Promise,
      TemplateLoader;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Promise = m.Promise;
    }],
    execute: function() {
      TemplateLoader = $__export("TemplateLoader", (function() {
        var TemplateLoader = function TemplateLoader() {};
        return ($traceurRuntime.createClass)(TemplateLoader, {load: function(url) {
            assert.argumentTypes(url, $traceurRuntime.type.string);
            return assert.returnType((null), Promise);
          }}, {});
      }()));
      Object.defineProperty(TemplateLoader.prototype.load, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("core/compiler/view", ["rtts_assert/rtts_assert", "facade/dom", "facade/collection", "change_detection/change_detection", "./element_injector", "./element_binder", "./directive_metadata", "reflection/types", "facade/lang", "di/di", "core/dom/element", "./viewport", "./interfaces", "./shadow_dom_emulation/content_tag", "./shadow_dom_emulation/light_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/view";
  var assert,
      DOM,
      Element,
      Node,
      Text,
      DocumentFragment,
      TemplateElement,
      ListWrapper,
      MapWrapper,
      StringMapWrapper,
      List,
      AST,
      ContextWithVariableBindings,
      ChangeDispatcher,
      ProtoChangeDetector,
      ChangeDetector,
      ChangeRecord,
      ProtoElementInjector,
      ElementInjector,
      PreBuiltObjects,
      ElementBinder,
      DirectiveMetadata,
      SetterFn,
      FIELD,
      IMPLEMENTS,
      int,
      isPresent,
      isBlank,
      BaseException,
      Injector,
      NgElement,
      ViewPort,
      OnChange,
      Content,
      LightDom,
      DestinationLightDom,
      NG_BINDING_CLASS,
      NG_BINDING_CLASS_SELECTOR,
      NO_FORMATTERS,
      View,
      ProtoView,
      ElementPropertyMemento,
      DirectivePropertyMemento,
      _groups,
      DirectivePropertyGroupMemento,
      PropertyUpdate;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      DOM = m.DOM;
      Element = m.Element;
      Node = m.Node;
      Text = m.Text;
      DocumentFragment = m.DocumentFragment;
      TemplateElement = m.TemplateElement;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
      StringMapWrapper = m.StringMapWrapper;
      List = m.List;
    }, function(m) {
      AST = m.AST;
      ContextWithVariableBindings = m.ContextWithVariableBindings;
      ChangeDispatcher = m.ChangeDispatcher;
      ProtoChangeDetector = m.ProtoChangeDetector;
      ChangeDetector = m.ChangeDetector;
      ChangeRecord = m.ChangeRecord;
    }, function(m) {
      ProtoElementInjector = m.ProtoElementInjector;
      ElementInjector = m.ElementInjector;
      PreBuiltObjects = m.PreBuiltObjects;
    }, function(m) {
      ElementBinder = m.ElementBinder;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }, function(m) {
      SetterFn = m.SetterFn;
    }, function(m) {
      FIELD = m.FIELD;
      IMPLEMENTS = m.IMPLEMENTS;
      int = m.int;
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      BaseException = m.BaseException;
    }, function(m) {
      Injector = m.Injector;
    }, function(m) {
      NgElement = m.NgElement;
    }, function(m) {
      ViewPort = m.ViewPort;
    }, function(m) {
      OnChange = m.OnChange;
    }, function(m) {
      Content = m.Content;
    }, function(m) {
      LightDom = m.LightDom;
      DestinationLightDom = m.DestinationLightDom;
    }],
    execute: function() {
      NG_BINDING_CLASS = 'ng-binding';
      NG_BINDING_CLASS_SELECTOR = '.ng-binding';
      NO_FORMATTERS = MapWrapper.create();
      View = $__export("View", (function() {
        var View = function View(proto, nodes, protoChangeDetector, protoContextLocals) {
          assert.argumentTypes(proto, ProtoView, nodes, List, protoChangeDetector, ProtoChangeDetector, protoContextLocals, Map);
          this.proto = proto;
          this.nodes = nodes;
          this.changeDetector = protoChangeDetector.instantiate(this, NO_FORMATTERS);
          this.elementInjectors = null;
          this.rootElementInjectors = null;
          this.textNodes = null;
          this.bindElements = null;
          this.componentChildViews = null;
          this.viewPorts = null;
          this.preBuiltObjects = null;
          this.context = null;
          this.contextWithLocals = (MapWrapper.size(protoContextLocals) > 0) ? new ContextWithVariableBindings(null, MapWrapper.clone(protoContextLocals)) : null;
        };
        return ($traceurRuntime.createClass)(View, {
          init: function(elementInjectors, rootElementInjectors, textNodes, bindElements, viewPorts, preBuiltObjects, componentChildViews) {
            assert.argumentTypes(elementInjectors, List, rootElementInjectors, List, textNodes, List, bindElements, List, viewPorts, List, preBuiltObjects, List, componentChildViews, List);
            this.elementInjectors = elementInjectors;
            this.rootElementInjectors = rootElementInjectors;
            this.textNodes = textNodes;
            this.bindElements = bindElements;
            this.viewPorts = viewPorts;
            this.preBuiltObjects = preBuiltObjects;
            this.componentChildViews = componentChildViews;
          },
          setLocal: function(contextName, value) {
            assert.argumentTypes(contextName, $traceurRuntime.type.string, value, $traceurRuntime.type.any);
            if (!this.hydrated())
              throw new BaseException('Cannot set locals on dehydrated view.');
            if (!MapWrapper.contains(this.proto.variableBindings, contextName)) {
              throw new BaseException(("Local binding " + contextName + " not defined in the view template."));
            }
            var templateName = MapWrapper.get(this.proto.variableBindings, contextName);
            this.context.set(templateName, value);
          },
          hydrated: function() {
            return isPresent(this.context);
          },
          _hydrateContext: function(newContext) {
            if (isPresent(this.contextWithLocals)) {
              this.contextWithLocals.parent = newContext;
              this.context = this.contextWithLocals;
            } else {
              this.context = newContext;
            }
            this.changeDetector.setContext(this.context);
          },
          _dehydrateContext: function() {
            if (isPresent(this.contextWithLocals)) {
              this.contextWithLocals.clearValues();
            }
            this.context = null;
          },
          hydrate: function(appInjector, hostElementInjector, context) {
            assert.argumentTypes(appInjector, Injector, hostElementInjector, ElementInjector, context, Object);
            if (this.hydrated())
              throw new BaseException('The view is already hydrated.');
            this._hydrateContext(context);
            for (var i = 0; i < this.viewPorts.length; i++) {
              this.viewPorts[i].hydrate(appInjector, hostElementInjector);
            }
            var binders = this.proto.elementBinders;
            var componentChildViewIndex = 0;
            for (var i = 0; i < binders.length; ++i) {
              var componentDirective = binders[i].componentDirective;
              var shadowDomAppInjector = null;
              if (isPresent(componentDirective)) {
                var services = componentDirective.annotation.componentServices;
                if (isPresent(services))
                  shadowDomAppInjector = appInjector.createChild(services);
                else {
                  shadowDomAppInjector = appInjector;
                }
              } else {
                shadowDomAppInjector = null;
              }
              var elementInjector = this.elementInjectors[i];
              if (isPresent(elementInjector)) {
                elementInjector.instantiateDirectives(appInjector, shadowDomAppInjector, this.preBuiltObjects[i]);
              }
              if (isPresent(componentDirective)) {
                this.componentChildViews[componentChildViewIndex++].hydrate(shadowDomAppInjector, elementInjector, elementInjector.getComponent());
              }
            }
            for (var i = 0; i < binders.length; ++i) {
              var componentDirective = binders[i].componentDirective;
              if (isPresent(componentDirective)) {
                var lightDom = this.preBuiltObjects[i].lightDom;
                if (isPresent(lightDom)) {
                  lightDom.redistribute();
                }
              }
            }
          },
          dehydrate: function() {
            for (var i = 0; i < this.componentChildViews.length; i++) {
              this.componentChildViews[i].dehydrate();
            }
            for (var i = 0; i < this.elementInjectors.length; i++) {
              if (isPresent(this.elementInjectors[i])) {
                this.elementInjectors[i].clearDirectives();
              }
            }
            if (isPresent(this.viewPorts)) {
              for (var i = 0; i < this.viewPorts.length; i++) {
                this.viewPorts[i].dehydrate();
              }
            }
            this._dehydrateContext();
          },
          onRecordChange: function(groupMemento, records) {
            assert.argumentTypes(groupMemento, $traceurRuntime.type.any, records, List);
            this._invokeMementos(records);
            if (groupMemento instanceof DirectivePropertyGroupMemento) {
              this._notifyDirectiveAboutChanges(groupMemento, records);
            }
          },
          _invokeMementos: function(records) {
            assert.argumentTypes(records, List);
            for (var i = 0; i < records.length; ++i) {
              this._invokeMementoFor(records[i]);
            }
          },
          _notifyDirectiveAboutChanges: function(groupMemento, records) {
            assert.argumentTypes(groupMemento, $traceurRuntime.type.any, records, List);
            var dir = groupMemento.directive(this.elementInjectors);
            if (dir instanceof OnChange) {
              dir.onChange(this._collectChanges(records));
            }
          },
          _invokeMementoFor: function(record) {
            assert.argumentTypes(record, ChangeRecord);
            var memento = record.bindingMemento;
            if (memento instanceof DirectivePropertyMemento) {
              var directiveMemento = assert.type(memento, DirectivePropertyMemento);
              directiveMemento.invoke(record, this.elementInjectors);
            } else if (memento instanceof ElementPropertyMemento) {
              var elementMemento = assert.type(memento, ElementPropertyMemento);
              elementMemento.invoke(record, this.bindElements);
            } else {
              var textNodeIndex = assert.type(memento, $traceurRuntime.type.number);
              DOM.setText(this.textNodes[textNodeIndex], record.currentValue);
            }
          },
          _collectChanges: function(records) {
            assert.argumentTypes(records, List);
            var changes = StringMapWrapper.create();
            for (var i = 0; i < records.length; ++i) {
              var record = records[i];
              var propertyUpdate = new PropertyUpdate(record.currentValue, record.previousValue);
              StringMapWrapper.set(changes, record.bindingMemento._setterName, propertyUpdate);
            }
            return changes;
          }
        }, {});
      }()));
      Object.defineProperty(View, "annotations", {get: function() {
          return [new IMPLEMENTS(ChangeDispatcher)];
        }});
      Object.defineProperty(View, "parameters", {get: function() {
          return [[ProtoView], [List], [ProtoChangeDetector], [Map]];
        }});
      Object.defineProperty(View.prototype.init, "parameters", {get: function() {
          return [[List], [List], [List], [List], [List], [List], [List]];
        }});
      Object.defineProperty(View.prototype.setLocal, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], []];
        }});
      Object.defineProperty(View.prototype.hydrate, "parameters", {get: function() {
          return [[Injector], [ElementInjector], [Object]];
        }});
      Object.defineProperty(View.prototype.onRecordChange, "parameters", {get: function() {
          return [[], [List]];
        }});
      Object.defineProperty(View.prototype._invokeMementos, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(View.prototype._notifyDirectiveAboutChanges, "parameters", {get: function() {
          return [[], [List]];
        }});
      Object.defineProperty(View.prototype._invokeMementoFor, "parameters", {get: function() {
          return [[ChangeRecord]];
        }});
      Object.defineProperty(View.prototype._collectChanges, "parameters", {get: function() {
          return [[List]];
        }});
      ProtoView = $__export("ProtoView", (function() {
        var ProtoView = function ProtoView(template, protoChangeDetector) {
          assert.argumentTypes(template, Element, protoChangeDetector, ProtoChangeDetector);
          this.element = template;
          this.elementBinders = [];
          this.variableBindings = MapWrapper.create();
          this.protoContextLocals = MapWrapper.create();
          this.protoChangeDetector = protoChangeDetector;
          this.textNodesWithBindingCount = 0;
          this.elementsWithBindingCount = 0;
          this.instantiateInPlace = false;
          this.rootBindingOffset = (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS)) ? 1 : 0;
          this.isTemplateElement = this.element instanceof TemplateElement;
        };
        return ($traceurRuntime.createClass)(ProtoView, {
          instantiate: function(hostElementInjector) {
            assert.argumentTypes(hostElementInjector, ElementInjector);
            var rootElementClone = this.instantiateInPlace ? this.element : DOM.clone(this.element);
            var elementsWithBindingsDynamic;
            if (this.isTemplateElement) {
              elementsWithBindingsDynamic = DOM.querySelectorAll(rootElementClone.content, NG_BINDING_CLASS_SELECTOR);
            } else {
              elementsWithBindingsDynamic = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
            }
            var elementsWithBindings = ListWrapper.createFixedSize(elementsWithBindingsDynamic.length);
            for (var i = 0; i < elementsWithBindingsDynamic.length; ++i) {
              elementsWithBindings[i] = elementsWithBindingsDynamic[i];
            }
            var viewNodes;
            if (this.isTemplateElement) {
              var childNode = DOM.firstChild(rootElementClone.content);
              viewNodes = [];
              while (childNode != null) {
                ListWrapper.push(viewNodes, childNode);
                childNode = DOM.nextSibling(childNode);
              }
            } else {
              viewNodes = [rootElementClone];
            }
            var view = new View(this, viewNodes, this.protoChangeDetector, this.protoContextLocals);
            var binders = this.elementBinders;
            var elementInjectors = ListWrapper.createFixedSize(binders.length);
            var rootElementInjectors = [];
            var textNodes = [];
            var elementsWithPropertyBindings = [];
            var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
            var viewPorts = [];
            var componentChildViews = [];
            for (var i = 0; i < binders.length; i++) {
              var binder = binders[i];
              var element = void 0;
              if (i === 0 && this.rootBindingOffset === 1) {
                element = rootElementClone;
              } else {
                element = elementsWithBindings[i - this.rootBindingOffset];
              }
              var elementInjector = null;
              var protoElementInjector = binder.protoElementInjector;
              if (isPresent(protoElementInjector)) {
                if (isPresent(protoElementInjector.parent)) {
                  var parentElementInjector = elementInjectors[protoElementInjector.parent.index];
                  elementInjector = protoElementInjector.instantiate(parentElementInjector, null, binder.events);
                } else {
                  elementInjector = protoElementInjector.instantiate(null, hostElementInjector, binder.events);
                  ListWrapper.push(rootElementInjectors, elementInjector);
                }
              }
              elementInjectors[i] = elementInjector;
              if (binder.hasElementPropertyBindings) {
                ListWrapper.push(elementsWithPropertyBindings, element);
              }
              var textNodeIndices = binder.textNodeIndices;
              if (isPresent(textNodeIndices)) {
                var childNode = DOM.firstChild(DOM.templateAwareRoot(element));
                for (var j = 0,
                    k = 0; j < textNodeIndices.length; j++) {
                  for (var index = textNodeIndices[j]; k < index; k++) {
                    childNode = DOM.nextSibling(childNode);
                  }
                  ListWrapper.push(textNodes, childNode);
                }
              }
              var lightDom = null;
              if (isPresent(binder.componentDirective)) {
                var childView = binder.nestedProtoView.instantiate(elementInjector);
                view.changeDetector.addChild(childView.changeDetector);
                lightDom = binder.componentDirective.shadowDomStrategy.constructLightDom(view, childView, element);
                binder.componentDirective.shadowDomStrategy.attachTemplate(element, childView);
                ListWrapper.push(componentChildViews, childView);
              }
              var viewPort = null;
              if (isPresent(binder.templateDirective)) {
                var destLightDom = this._parentElementLightDom(protoElementInjector, preBuiltObjects);
                viewPort = new ViewPort(view, element, binder.nestedProtoView, elementInjector, destLightDom);
                ListWrapper.push(viewPorts, viewPort);
              }
              if (isPresent(elementInjector)) {
                preBuiltObjects[i] = new PreBuiltObjects(view, new NgElement(element), viewPort, lightDom);
              }
              if (isPresent(binder.events)) {
                MapWrapper.forEach(binder.events, (function(expr, eventName) {
                  if (isBlank(elementInjector) || !elementInjector.hasEventEmitter(eventName)) {
                    ProtoView._addNativeEventListener(element, eventName, expr, view);
                  }
                }));
              }
            }
            view.init(elementInjectors, rootElementInjectors, textNodes, elementsWithPropertyBindings, viewPorts, preBuiltObjects, componentChildViews);
            return assert.returnType((view), View);
          },
          _parentElementLightDom: function(protoElementInjector, preBuiltObjects) {
            assert.argumentTypes(protoElementInjector, ProtoElementInjector, preBuiltObjects, List);
            var p = protoElementInjector.parent;
            return assert.returnType((isPresent(p) ? preBuiltObjects[p.index].lightDom : null), LightDom);
          },
          bindVariable: function(contextName, templateName) {
            assert.argumentTypes(contextName, $traceurRuntime.type.string, templateName, $traceurRuntime.type.string);
            MapWrapper.set(this.variableBindings, contextName, templateName);
            MapWrapper.set(this.protoContextLocals, templateName, null);
          },
          bindElement: function(protoElementInjector) {
            var componentDirective = arguments[1] !== (void 0) ? arguments[1] : null;
            var templateDirective = arguments[2] !== (void 0) ? arguments[2] : null;
            assert.argumentTypes(protoElementInjector, ProtoElementInjector, componentDirective, DirectiveMetadata, templateDirective, DirectiveMetadata);
            var elBinder = new ElementBinder(protoElementInjector, componentDirective, templateDirective);
            ListWrapper.push(this.elementBinders, elBinder);
            return assert.returnType((elBinder), ElementBinder);
          },
          bindTextNode: function(indexInParent, expression) {
            assert.argumentTypes(indexInParent, int, expression, AST);
            var elBinder = this.elementBinders[this.elementBinders.length - 1];
            if (isBlank(elBinder.textNodeIndices)) {
              elBinder.textNodeIndices = ListWrapper.create();
            }
            ListWrapper.push(elBinder.textNodeIndices, indexInParent);
            var memento = this.textNodesWithBindingCount++;
            this.protoChangeDetector.addAst(expression, memento, memento);
          },
          bindElementProperty: function(expression, setterName, setter) {
            assert.argumentTypes(expression, AST, setterName, $traceurRuntime.type.string, setter, SetterFn);
            var elBinder = this.elementBinders[this.elementBinders.length - 1];
            if (!elBinder.hasElementPropertyBindings) {
              elBinder.hasElementPropertyBindings = true;
              this.elementsWithBindingCount++;
            }
            var memento = new ElementPropertyMemento(this.elementsWithBindingCount - 1, setterName, setter);
            this.protoChangeDetector.addAst(expression, memento, memento);
          },
          bindEvent: function(eventName, expression) {
            assert.argumentTypes(eventName, $traceurRuntime.type.string, expression, AST);
            var elBinder = this.elementBinders[this.elementBinders.length - 1];
            if (isBlank(elBinder.events)) {
              elBinder.events = MapWrapper.create();
            }
            MapWrapper.set(elBinder.events, eventName, expression);
          },
          bindDirectiveProperty: function(directiveIndex, expression, setterName, setter, isContentWatch) {
            assert.argumentTypes(directiveIndex, $traceurRuntime.type.number, expression, AST, setterName, $traceurRuntime.type.string, setter, SetterFn, isContentWatch, $traceurRuntime.type.boolean);
            var expMemento = new DirectivePropertyMemento(this.elementBinders.length - 1, directiveIndex, setterName, setter);
            var groupMemento = DirectivePropertyGroupMemento.get(expMemento);
            this.protoChangeDetector.addAst(expression, expMemento, groupMemento, isContentWatch);
          }
        }, {
          _addNativeEventListener: function(element, eventName, expr, view) {
            assert.argumentTypes(element, Element, eventName, $traceurRuntime.type.string, expr, AST, view, View);
            var locals = MapWrapper.create();
            var innerCallback = ProtoView.buildInnerCallback(expr, view, locals);
            DOM.on(element, eventName, (function(event) {
              if (event.target === element) {
                innerCallback(event);
              }
            }));
          },
          buildInnerCallback: function(expr, view, locals) {
            assert.argumentTypes(expr, AST, view, View, locals, Map);
            return (function(event) {
              if (view.hydrated()) {
                MapWrapper.set(locals, '\$event', event);
                var context = new ContextWithVariableBindings(view.context, locals);
                expr.eval(context);
              }
            });
          },
          createRootProtoView: function(protoView, insertionElement, rootComponentAnnotatedType) {
            assert.argumentTypes(protoView, ProtoView, insertionElement, $traceurRuntime.type.any, rootComponentAnnotatedType, DirectiveMetadata);
            DOM.addClass(insertionElement, 'ng-binding');
            var rootProtoView = new ProtoView(insertionElement, new ProtoChangeDetector());
            rootProtoView.instantiateInPlace = true;
            var binder = rootProtoView.bindElement(new ProtoElementInjector(null, 0, [rootComponentAnnotatedType.type], true));
            binder.componentDirective = rootComponentAnnotatedType;
            binder.nestedProtoView = protoView;
            return assert.returnType((rootProtoView), ProtoView);
          }
        });
      }()));
      Object.defineProperty(ProtoView, "parameters", {get: function() {
          return [[Element], [ProtoChangeDetector]];
        }});
      Object.defineProperty(ProtoView.prototype.instantiate, "parameters", {get: function() {
          return [[ElementInjector]];
        }});
      Object.defineProperty(ProtoView._addNativeEventListener, "parameters", {get: function() {
          return [[Element], [$traceurRuntime.type.string], [AST], [View]];
        }});
      Object.defineProperty(ProtoView.buildInnerCallback, "parameters", {get: function() {
          return [[AST], [View], [Map]];
        }});
      Object.defineProperty(ProtoView.prototype._parentElementLightDom, "parameters", {get: function() {
          return [[ProtoElementInjector], [List]];
        }});
      Object.defineProperty(ProtoView.prototype.bindVariable, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(ProtoView.prototype.bindElement, "parameters", {get: function() {
          return [[ProtoElementInjector], [DirectiveMetadata], [DirectiveMetadata]];
        }});
      Object.defineProperty(ProtoView.prototype.bindTextNode, "parameters", {get: function() {
          return [[int], [AST]];
        }});
      Object.defineProperty(ProtoView.prototype.bindElementProperty, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [SetterFn]];
        }});
      Object.defineProperty(ProtoView.prototype.bindEvent, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [AST]];
        }});
      Object.defineProperty(ProtoView.prototype.bindDirectiveProperty, "parameters", {get: function() {
          return [[$traceurRuntime.type.number], [AST], [$traceurRuntime.type.string], [SetterFn], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(ProtoView.createRootProtoView, "parameters", {get: function() {
          return [[ProtoView], [], [DirectiveMetadata]];
        }});
      ElementPropertyMemento = $__export("ElementPropertyMemento", (function() {
        var ElementPropertyMemento = function ElementPropertyMemento(elementIndex, setterName, setter) {
          assert.argumentTypes(elementIndex, int, setterName, $traceurRuntime.type.string, setter, SetterFn);
          this._elementIndex = elementIndex;
          this._setterName = setterName;
          this._setter = setter;
        };
        return ($traceurRuntime.createClass)(ElementPropertyMemento, {invoke: function(record, bindElements) {
            assert.argumentTypes(record, ChangeRecord, bindElements, List);
            var element = assert.type(bindElements[this._elementIndex], Element);
            this._setter(element, record.currentValue);
          }}, {});
      }()));
      Object.defineProperty(ElementPropertyMemento, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.string], [SetterFn]];
        }});
      Object.defineProperty(ElementPropertyMemento.prototype.invoke, "parameters", {get: function() {
          return [[ChangeRecord], [List]];
        }});
      DirectivePropertyMemento = $__export("DirectivePropertyMemento", (function() {
        var DirectivePropertyMemento = function DirectivePropertyMemento(elementInjectorIndex, directiveIndex, setterName, setter) {
          assert.argumentTypes(elementInjectorIndex, $traceurRuntime.type.number, directiveIndex, $traceurRuntime.type.number, setterName, $traceurRuntime.type.string, setter, SetterFn);
          this._elementInjectorIndex = elementInjectorIndex;
          this._directiveIndex = directiveIndex;
          this._setterName = setterName;
          this._setter = setter;
        };
        return ($traceurRuntime.createClass)(DirectivePropertyMemento, {invoke: function(record, elementInjectors) {
            assert.argumentTypes(record, ChangeRecord, elementInjectors, List);
            var elementInjector = assert.type(elementInjectors[this._elementInjectorIndex], ElementInjector);
            var directive = elementInjector.getAtIndex(this._directiveIndex);
            this._setter(directive, record.currentValue);
          }}, {});
      }()));
      Object.defineProperty(DirectivePropertyMemento, "parameters", {get: function() {
          return [[$traceurRuntime.type.number], [$traceurRuntime.type.number], [$traceurRuntime.type.string], [SetterFn]];
        }});
      Object.defineProperty(DirectivePropertyMemento.prototype.invoke, "parameters", {get: function() {
          return [[ChangeRecord], [List]];
        }});
      _groups = MapWrapper.create();
      DirectivePropertyGroupMemento = (function() {
        var DirectivePropertyGroupMemento = function DirectivePropertyGroupMemento(elementInjectorIndex, directiveIndex) {
          assert.argumentTypes(elementInjectorIndex, $traceurRuntime.type.number, directiveIndex, $traceurRuntime.type.number);
          this._elementInjectorIndex = elementInjectorIndex;
          this._directiveIndex = directiveIndex;
        };
        return ($traceurRuntime.createClass)(DirectivePropertyGroupMemento, {directive: function(elementInjectors) {
            assert.argumentTypes(elementInjectors, List);
            var elementInjector = assert.type(elementInjectors[this._elementInjectorIndex], ElementInjector);
            return elementInjector.getAtIndex(this._directiveIndex);
          }}, {get: function(memento) {
            assert.argumentTypes(memento, DirectivePropertyMemento);
            var elementInjectorIndex = memento._elementInjectorIndex;
            var directiveIndex = memento._directiveIndex;
            var id = elementInjectorIndex * 100 + directiveIndex;
            if (!MapWrapper.contains(_groups, id)) {
              MapWrapper.set(_groups, id, new DirectivePropertyGroupMemento(elementInjectorIndex, directiveIndex));
            }
            return MapWrapper.get(_groups, id);
          }});
      }());
      Object.defineProperty(DirectivePropertyGroupMemento, "parameters", {get: function() {
          return [[$traceurRuntime.type.number], [$traceurRuntime.type.number]];
        }});
      Object.defineProperty(DirectivePropertyGroupMemento.get, "parameters", {get: function() {
          return [[DirectivePropertyMemento]];
        }});
      Object.defineProperty(DirectivePropertyGroupMemento.prototype.directive, "parameters", {get: function() {
          return [[List]];
        }});
      PropertyUpdate = (function() {
        var PropertyUpdate = function PropertyUpdate(currentValue, previousValue) {
          this.currentValue = currentValue;
          this.previousValue = previousValue;
        };
        return ($traceurRuntime.createClass)(PropertyUpdate, {}, {});
      }());
    }
  };
});




System.register("core/compiler/viewport", ["rtts_assert/rtts_assert", "./view", "facade/dom", "facade/collection", "facade/lang", "di/di", "core/compiler/element_injector"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/viewport";
  var assert,
      View,
      ProtoView,
      DOM,
      Node,
      Element,
      ListWrapper,
      MapWrapper,
      List,
      BaseException,
      Injector,
      ElementInjector,
      isPresent,
      isBlank,
      ViewPort;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      View = m.View;
      ProtoView = m.ProtoView;
    }, function(m) {
      DOM = m.DOM;
      Node = m.Node;
      Element = m.Element;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
      List = m.List;
    }, function(m) {
      BaseException = m.BaseException;
      isPresent = m.isPresent;
      isBlank = m.isBlank;
    }, function(m) {
      Injector = m.Injector;
    }, function(m) {
      ElementInjector = m.ElementInjector;
    }],
    execute: function() {
      ViewPort = $__export("ViewPort", (function() {
        var ViewPort = function ViewPort(parentView, templateElement, defaultProtoView, elementInjector) {
          var lightDom = arguments[4] !== (void 0) ? arguments[4] : null;
          assert.argumentTypes(parentView, View, templateElement, Element, defaultProtoView, ProtoView, elementInjector, ElementInjector, lightDom, $traceurRuntime.type.any);
          this.parentView = parentView;
          this.templateElement = templateElement;
          this.defaultProtoView = defaultProtoView;
          this.elementInjector = elementInjector;
          this._lightDom = lightDom;
          this._views = [];
          this.appInjector = null;
          this.hostElementInjector = null;
        };
        return ($traceurRuntime.createClass)(ViewPort, {
          hydrate: function(appInjector, hostElementInjector) {
            assert.argumentTypes(appInjector, Injector, hostElementInjector, ElementInjector);
            this.appInjector = appInjector;
            this.hostElementInjector = hostElementInjector;
          },
          dehydrate: function() {
            this.appInjector = null;
            this.hostElementInjector = null;
            this.clear();
          },
          clear: function() {
            for (var i = this._views.length - 1; i >= 0; i--) {
              this.remove(i);
            }
          },
          get: function(index) {
            assert.argumentTypes(index, $traceurRuntime.type.number);
            return assert.returnType((this._views[index]), View);
          },
          get length() {
            return this._views.length;
          },
          _siblingToInsertAfter: function(index) {
            assert.argumentTypes(index, $traceurRuntime.type.number);
            if (index == 0)
              return this.templateElement;
            return ListWrapper.last(this._views[index - 1].nodes);
          },
          hydrated: function() {
            return isPresent(this.appInjector);
          },
          create: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (!this.hydrated())
              throw new BaseException('Cannot create views on a dehydrated view port');
            var newView = this.defaultProtoView.instantiate(this.hostElementInjector);
            newView.hydrate(this.appInjector, this.hostElementInjector, this.parentView.context);
            return assert.returnType((this.insert(newView, atIndex)), View);
          },
          insert: function(view) {
            var atIndex = arguments[1] !== (void 0) ? arguments[1] : -1;
            if (atIndex == -1)
              atIndex = this._views.length;
            ListWrapper.insert(this._views, atIndex, view);
            if (isBlank(this._lightDom)) {
              ViewPort.moveViewNodesAfterSibling(this._siblingToInsertAfter(atIndex), view);
            } else {
              this._lightDom.redistribute();
            }
            this.parentView.changeDetector.addChild(view.changeDetector);
            this._linkElementInjectors(view);
            return assert.returnType((view), View);
          },
          remove: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (atIndex == -1)
              atIndex = this._views.length - 1;
            var view = this.detach(atIndex);
            view.dehydrate();
          },
          detach: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (atIndex == -1)
              atIndex = this._views.length - 1;
            var detachedView = this.get(atIndex);
            ListWrapper.removeAt(this._views, atIndex);
            if (isBlank(this._lightDom)) {
              ViewPort.removeViewNodesFromParent(this.templateElement.parentNode, detachedView);
            } else {
              this._lightDom.redistribute();
            }
            detachedView.changeDetector.remove();
            this._unlinkElementInjectors(detachedView);
            return assert.returnType((detachedView), View);
          },
          contentTagContainers: function() {
            return this._views;
          },
          nodes: function() {
            var r = [];
            for (var i = 0; i < this._views.length; ++i) {
              r = ListWrapper.concat(r, this._views[i].nodes);
            }
            return assert.returnType((r), List);
          },
          _linkElementInjectors: function(view) {
            for (var i = 0; i < view.rootElementInjectors.length; ++i) {
              view.rootElementInjectors[i].parent = this.elementInjector;
            }
          },
          _unlinkElementInjectors: function(view) {
            for (var i = 0; i < view.rootElementInjectors.length; ++i) {
              view.rootElementInjectors[i].parent = null;
            }
          }
        }, {
          moveViewNodesAfterSibling: function(sibling, view) {
            for (var i = view.nodes.length - 1; i >= 0; --i) {
              DOM.insertAfter(sibling, view.nodes[i]);
            }
          },
          removeViewNodesFromParent: function(parent, view) {
            for (var i = view.nodes.length - 1; i >= 0; --i) {
              DOM.removeChild(parent, view.nodes[i]);
            }
          }
        });
      }()));
      Object.defineProperty(ViewPort, "parameters", {get: function() {
          return [[View], [Element], [ProtoView], [ElementInjector], []];
        }});
      Object.defineProperty(ViewPort.prototype.hydrate, "parameters", {get: function() {
          return [[Injector], [ElementInjector]];
        }});
      Object.defineProperty(ViewPort.prototype.get, "parameters", {get: function() {
          return [[$traceurRuntime.type.number]];
        }});
      Object.defineProperty(ViewPort.prototype._siblingToInsertAfter, "parameters", {get: function() {
          return [[$traceurRuntime.type.number]];
        }});
    }
  };
});




System.register("core/dom/element", ["rtts_assert/rtts_assert", "facade/dom", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "core/dom/element";
  var assert,
      DOM,
      Element,
      normalizeBlank,
      NgElement;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      DOM = m.DOM;
      Element = m.Element;
    }, function(m) {
      normalizeBlank = m.normalizeBlank;
    }],
    execute: function() {
      NgElement = $__export("NgElement", (function() {
        var NgElement = function NgElement(domElement) {
          assert.argumentTypes(domElement, Element);
          this.domElement = domElement;
        };
        return ($traceurRuntime.createClass)(NgElement, {getAttribute: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            return normalizeBlank(DOM.getAttribute(this.domElement, name));
          }}, {});
      }()));
      Object.defineProperty(NgElement, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(NgElement.prototype.getAttribute, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("core/life_cycle/life_cycle", ["rtts_assert/rtts_assert", "facade/lang", "change_detection/change_detection", "core/zone/vm_turn_zone", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "core/life_cycle/life_cycle";
  var assert,
      FIELD,
      print,
      ChangeDetector,
      VmTurnZone,
      ListWrapper,
      LifeCycle;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      FIELD = m.FIELD;
      print = m.print;
    }, function(m) {
      ChangeDetector = m.ChangeDetector;
    }, function(m) {
      VmTurnZone = m.VmTurnZone;
    }, function(m) {
      ListWrapper = m.ListWrapper;
    }],
    execute: function() {
      LifeCycle = $__export("LifeCycle", (function() {
        var LifeCycle = function LifeCycle(changeDetector) {
          var enforceNoNewChanges = arguments[1] !== (void 0) ? arguments[1] : false;
          assert.argumentTypes(changeDetector, ChangeDetector, enforceNoNewChanges, $traceurRuntime.type.boolean);
          this._changeDetector = changeDetector;
          this._enforceNoNewChanges = enforceNoNewChanges;
        };
        return ($traceurRuntime.createClass)(LifeCycle, {
          registerWith: function(zone) {
            var $__0 = this;
            var errorHandler = (function(exception, stackTrace) {
              var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
              print((exception + "\n\n" + longStackTrace));
              throw exception;
            });
            zone.initCallbacks({
              onErrorHandler: errorHandler,
              onTurnDone: (function() {
                return $__0.tick();
              })
            });
          },
          tick: function() {
            this._changeDetector.detectChanges();
            if (this._enforceNoNewChanges) {
              this._changeDetector.checkNoChanges();
            }
          }
        }, {});
      }()));
      Object.defineProperty(LifeCycle, "parameters", {get: function() {
          return [[ChangeDetector], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(LifeCycle.prototype.registerWith, "parameters", {get: function() {
          return [[VmTurnZone]];
        }});
    }
  };
});




System.register("core/zone/vm_turn_zone", ["facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "core/zone/vm_turn_zone";
  var List,
      ListWrapper,
      StringMapWrapper,
      normalizeBlank,
      isPresent,
      VmTurnZone;
  return {
    setters: [function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      normalizeBlank = m.normalizeBlank;
      isPresent = m.isPresent;
    }],
    execute: function() {
      VmTurnZone = $__export("VmTurnZone", (function() {
        var VmTurnZone = function VmTurnZone($__2) {
          var enableLongStackTrace = $__2.enableLongStackTrace;
          this._nestedRunCounter = 0;
          this._onTurnStart = null;
          this._onTurnDone = null;
          this._onErrorHandler = null;
          this._outerZone = window.zone;
          this._innerZone = this._createInnerZone(this._outerZone, enableLongStackTrace);
        };
        return ($traceurRuntime.createClass)(VmTurnZone, {
          initCallbacks: function() {
            var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
                onTurnStart = $__2.onTurnStart,
                onTurnDone = $__2.onTurnDone,
                onScheduleMicrotask = $__2.onScheduleMicrotask,
                onErrorHandler = $__2.onErrorHandler;
            this._onTurnStart = normalizeBlank(onTurnStart);
            this._onTurnDone = normalizeBlank(onTurnDone);
            this._onErrorHandler = normalizeBlank(onErrorHandler);
          },
          run: function(fn) {
            return this._innerZone.run(fn);
          },
          runOutsideAngular: function(fn) {
            return this._outerZone.run(fn);
          },
          _createInnerZone: function(zone, enableLongStackTrace) {
            var $__0 = this;
            var vmTurnZone = this;
            var errorHandling;
            if (enableLongStackTrace) {
              errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone, {onError: function(e) {
                  vmTurnZone._onError(this, e);
                }});
            } else {
              errorHandling = {onError: function(e) {
                  vmTurnZone._onError(this, e);
                }};
            }
            return zone.fork(errorHandling).fork({
              beforeTask: (function() {
                $__0._beforeTask();
              }),
              afterTask: (function() {
                $__0._afterTask();
              })
            });
          },
          _beforeTask: function() {
            this._nestedRunCounter++;
            if (this._nestedRunCounter === 1 && this._onTurnStart) {
              this._onTurnStart();
            }
          },
          _afterTask: function() {
            this._nestedRunCounter--;
            if (this._nestedRunCounter === 0 && this._onTurnDone) {
              this._onTurnDone();
            }
          },
          _onError: function(zone, e) {
            if (isPresent(this._onErrorHandler)) {
              var trace = [normalizeBlank(e.stack)];
              while (zone && zone.constructedAtException) {
                trace.push(zone.constructedAtException.get());
                zone = zone.parent;
              }
              this._onErrorHandler(e, trace);
            } else {
              throw e;
            }
          }
        }, {});
      }()));
    }
  };
});




System.register("di/annotations", ["facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "di/annotations";
  var CONST,
      Inject,
      InjectPromise,
      InjectLazy,
      DependencyAnnotation;
  return {
    setters: [function(m) {
      CONST = m.CONST;
    }],
    execute: function() {
      Inject = $__export("Inject", (function() {
        var Inject = function Inject(token) {
          this.token = token;
        };
        return ($traceurRuntime.createClass)(Inject, {}, {});
      }()));
      Object.defineProperty(Inject, "annotations", {get: function() {
          return [new CONST()];
        }});
      InjectPromise = $__export("InjectPromise", (function() {
        var InjectPromise = function InjectPromise(token) {
          this.token = token;
        };
        return ($traceurRuntime.createClass)(InjectPromise, {}, {});
      }()));
      Object.defineProperty(InjectPromise, "annotations", {get: function() {
          return [new CONST()];
        }});
      InjectLazy = $__export("InjectLazy", (function() {
        var InjectLazy = function InjectLazy(token) {
          this.token = token;
        };
        return ($traceurRuntime.createClass)(InjectLazy, {}, {});
      }()));
      Object.defineProperty(InjectLazy, "annotations", {get: function() {
          return [new CONST()];
        }});
      DependencyAnnotation = $__export("DependencyAnnotation", (function() {
        var DependencyAnnotation = function DependencyAnnotation() {};
        return ($traceurRuntime.createClass)(DependencyAnnotation, {}, {});
      }()));
      Object.defineProperty(DependencyAnnotation, "annotations", {get: function() {
          return [new CONST()];
        }});
    }
  };
});




System.register("di/binding", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "reflection/reflection", "./key", "./annotations", "./exceptions"], function($__export) {
  "use strict";
  var __moduleName = "di/binding";
  var assert,
      FIELD,
      Type,
      isBlank,
      isPresent,
      List,
      MapWrapper,
      ListWrapper,
      reflector,
      Key,
      Inject,
      InjectLazy,
      InjectPromise,
      DependencyAnnotation,
      NoAnnotationError,
      Dependency,
      Binding,
      BindingBuilder;
  function bind(token) {
    return assert.returnType((new BindingBuilder(token)), BindingBuilder);
  }
  function _dependenciesFor(typeOrFunc) {
    var params = reflector.parameters(typeOrFunc);
    if (isBlank(params))
      return assert.returnType(([]), List);
    if (ListWrapper.any(params, (function(p) {
      return isBlank(p);
    })))
      throw new NoAnnotationError(typeOrFunc);
    return assert.returnType((ListWrapper.map(params, (function(p) {
      return _extractToken(typeOrFunc, p);
    }))), List);
  }
  function _extractToken(typeOrFunc, annotations) {
    var type;
    var depProps = [];
    for (var i = 0; i < annotations.length; ++i) {
      var paramAnnotation = annotations[i];
      if (paramAnnotation instanceof Type) {
        type = paramAnnotation;
      } else if (paramAnnotation instanceof Inject) {
        return _createDependency(paramAnnotation.token, false, false, []);
      } else if (paramAnnotation instanceof InjectPromise) {
        return _createDependency(paramAnnotation.token, true, false, []);
      } else if (paramAnnotation instanceof InjectLazy) {
        return _createDependency(paramAnnotation.token, false, true, []);
      } else if (paramAnnotation instanceof DependencyAnnotation) {
        ListWrapper.push(depProps, paramAnnotation);
      }
    }
    if (isPresent(type)) {
      return _createDependency(type, false, false, depProps);
    } else {
      throw new NoAnnotationError(typeOrFunc);
    }
  }
  function _createDependency(token, asPromise, lazy, depProps) {
    return assert.returnType((new Dependency(Key.get(token), asPromise, lazy, depProps)), Dependency);
  }
  $__export("bind", bind);
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      FIELD = m.FIELD;
      Type = m.Type;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
    }, function(m) {
      List = m.List;
      MapWrapper = m.MapWrapper;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      reflector = m.reflector;
    }, function(m) {
      Key = m.Key;
    }, function(m) {
      Inject = m.Inject;
      InjectLazy = m.InjectLazy;
      InjectPromise = m.InjectPromise;
      DependencyAnnotation = m.DependencyAnnotation;
    }, function(m) {
      NoAnnotationError = m.NoAnnotationError;
    }],
    execute: function() {
      Dependency = $__export("Dependency", (function() {
        var Dependency = function Dependency(key, asPromise, lazy, properties) {
          assert.argumentTypes(key, Key, asPromise, $traceurRuntime.type.boolean, lazy, $traceurRuntime.type.boolean, properties, List);
          this.key = key;
          this.asPromise = asPromise;
          this.lazy = lazy;
          this.properties = properties;
        };
        return ($traceurRuntime.createClass)(Dependency, {}, {});
      }()));
      Object.defineProperty(Dependency, "parameters", {get: function() {
          return [[Key], [$traceurRuntime.type.boolean], [$traceurRuntime.type.boolean], [List]];
        }});
      Binding = $__export("Binding", (function() {
        var Binding = function Binding(key, factory, dependencies, providedAsPromise) {
          assert.argumentTypes(key, Key, factory, Function, dependencies, List, providedAsPromise, $traceurRuntime.type.boolean);
          this.key = key;
          this.factory = factory;
          this.dependencies = dependencies;
          this.providedAsPromise = providedAsPromise;
        };
        return ($traceurRuntime.createClass)(Binding, {}, {});
      }()));
      Object.defineProperty(Binding, "parameters", {get: function() {
          return [[Key], [Function], [List], [$traceurRuntime.type.boolean]];
        }});
      BindingBuilder = $__export("BindingBuilder", (function() {
        var BindingBuilder = function BindingBuilder(token) {
          this.token = token;
        };
        return ($traceurRuntime.createClass)(BindingBuilder, {
          toClass: function(type) {
            assert.argumentTypes(type, Type);
            return assert.returnType((new Binding(Key.get(this.token), reflector.factory(type), _dependenciesFor(type), false)), Binding);
          },
          toValue: function(value) {
            return assert.returnType((new Binding(Key.get(this.token), (function() {
              return value;
            }), [], false)), Binding);
          },
          toFactory: function(factoryFunction) {
            var dependencies = arguments[1] !== (void 0) ? arguments[1] : null;
            assert.argumentTypes(factoryFunction, Function, dependencies, List);
            return assert.returnType((new Binding(Key.get(this.token), factoryFunction, this._constructDependencies(factoryFunction, dependencies), false)), Binding);
          },
          toAsyncFactory: function(factoryFunction) {
            var dependencies = arguments[1] !== (void 0) ? arguments[1] : null;
            assert.argumentTypes(factoryFunction, Function, dependencies, List);
            return assert.returnType((new Binding(Key.get(this.token), factoryFunction, this._constructDependencies(factoryFunction, dependencies), true)), Binding);
          },
          _constructDependencies: function(factoryFunction, dependencies) {
            return isBlank(dependencies) ? _dependenciesFor(factoryFunction) : ListWrapper.map(dependencies, (function(t) {
              return new Dependency(Key.get(t), false, false, []);
            }));
          }
        }, {});
      }()));
      Object.defineProperty(BindingBuilder.prototype.toClass, "parameters", {get: function() {
          return [[Type]];
        }});
      Object.defineProperty(BindingBuilder.prototype.toFactory, "parameters", {get: function() {
          return [[Function], [List]];
        }});
      Object.defineProperty(BindingBuilder.prototype.toAsyncFactory, "parameters", {get: function() {
          return [[Function], [List]];
        }});
      Object.defineProperty(BindingBuilder.prototype._constructDependencies, "parameters", {get: function() {
          return [[Function], [List]];
        }});
    }
  };
});




System.register("di/di", ["./annotations", "./injector", "./binding", "./key", "./exceptions", "./opaque_token"], function($__export) {
  "use strict";
  var __moduleName = "di/di";
  return {
    setters: [function(m) {
      $__export("Inject", m.Inject);
      $__export("InjectPromise", m.InjectPromise);
      $__export("InjectLazy", m.InjectLazy);
      $__export("DependencyAnnotation", m.DependencyAnnotation);
    }, function(m) {
      $__export("Injector", m.Injector);
    }, function(m) {
      $__export("Binding", m.Binding);
      $__export("Dependency", m.Dependency);
      $__export("bind", m.bind);
    }, function(m) {
      $__export("Key", m.Key);
      $__export("KeyRegistry", m.KeyRegistry);
    }, function(m) {
      $__export("KeyMetadataError", m.KeyMetadataError);
      $__export("NoProviderError", m.NoProviderError);
      $__export("ProviderError", m.ProviderError);
      $__export("AsyncBindingError", m.AsyncBindingError);
      $__export("CyclicDependencyError", m.CyclicDependencyError);
      $__export("InstantiationError", m.InstantiationError);
      $__export("InvalidBindingError", m.InvalidBindingError);
      $__export("NoAnnotationError", m.NoAnnotationError);
    }, function(m) {
      $__export("OpaqueToken", m.OpaqueToken);
    }],
    execute: function() {}
  };
});




System.register("di/exceptions", ["rtts_assert/rtts_assert", "facade/collection", "facade/lang", "./key"], function($__export) {
  "use strict";
  var __moduleName = "di/exceptions";
  var assert,
      ListWrapper,
      List,
      stringify,
      Key,
      KeyMetadataError,
      ProviderError,
      NoProviderError,
      AsyncBindingError,
      CyclicDependencyError,
      InstantiationError,
      InvalidBindingError,
      NoAnnotationError;
  function findFirstClosedCycle(keys) {
    assert.argumentTypes(keys, List);
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
      if (ListWrapper.contains(res, keys[i])) {
        ListWrapper.push(res, keys[i]);
        return res;
      } else {
        ListWrapper.push(res, keys[i]);
      }
    }
    return res;
  }
  function constructResolvingPath(keys) {
    if (keys.length > 1) {
      var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
      var tokenStrs = ListWrapper.map(reversed, (function(k) {
        return stringify(k.token);
      }));
      return " (" + tokenStrs.join(' -> ') + ")";
    } else {
      return "";
    }
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      List = m.List;
    }, function(m) {
      stringify = m.stringify;
    }, function(m) {
      Key = m.Key;
    }],
    execute: function() {
      Object.defineProperty(findFirstClosedCycle, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(constructResolvingPath, "parameters", {get: function() {
          return [[List]];
        }});
      KeyMetadataError = $__export("KeyMetadataError", (function($__super) {
        var KeyMetadataError = function KeyMetadataError() {
          $traceurRuntime.superConstructor(KeyMetadataError).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(KeyMetadataError, {}, {}, $__super);
      }(Error)));
      ProviderError = $__export("ProviderError", (function($__super) {
        var ProviderError = function ProviderError(key, constructResolvingMessage) {
          assert.argumentTypes(key, Key, constructResolvingMessage, Function);
          this.keys = [key];
          this.constructResolvingMessage = constructResolvingMessage;
          this.message = this.constructResolvingMessage(this.keys);
        };
        return ($traceurRuntime.createClass)(ProviderError, {
          addKey: function(key) {
            assert.argumentTypes(key, Key);
            ListWrapper.push(this.keys, key);
            this.message = this.constructResolvingMessage(this.keys);
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(Error)));
      Object.defineProperty(ProviderError, "parameters", {get: function() {
          return [[Key], [Function]];
        }});
      Object.defineProperty(ProviderError.prototype.addKey, "parameters", {get: function() {
          return [[Key]];
        }});
      NoProviderError = $__export("NoProviderError", (function($__super) {
        var NoProviderError = function NoProviderError(key) {
          assert.argumentTypes(key, Key);
          $traceurRuntime.superConstructor(NoProviderError).call(this, key, function(keys) {
            assert.argumentTypes(keys, List);
            var first = stringify(ListWrapper.first(keys).token);
            return ("No provider for " + first + "!" + constructResolvingPath(keys));
          });
        };
        return ($traceurRuntime.createClass)(NoProviderError, {}, {}, $__super);
      }(ProviderError)));
      Object.defineProperty(NoProviderError, "parameters", {get: function() {
          return [[Key]];
        }});
      AsyncBindingError = $__export("AsyncBindingError", (function($__super) {
        var AsyncBindingError = function AsyncBindingError(key) {
          assert.argumentTypes(key, Key);
          $traceurRuntime.superConstructor(AsyncBindingError).call(this, key, function(keys) {
            assert.argumentTypes(keys, List);
            var first = stringify(ListWrapper.first(keys).token);
            return ("Cannot instantiate " + first + " synchronously. ") + ("It is provided as a promise!" + constructResolvingPath(keys));
          });
        };
        return ($traceurRuntime.createClass)(AsyncBindingError, {}, {}, $__super);
      }(ProviderError)));
      Object.defineProperty(AsyncBindingError, "parameters", {get: function() {
          return [[Key]];
        }});
      CyclicDependencyError = $__export("CyclicDependencyError", (function($__super) {
        var CyclicDependencyError = function CyclicDependencyError(key) {
          assert.argumentTypes(key, Key);
          $traceurRuntime.superConstructor(CyclicDependencyError).call(this, key, function(keys) {
            assert.argumentTypes(keys, List);
            return ("Cannot instantiate cyclic dependency!" + constructResolvingPath(keys));
          });
        };
        return ($traceurRuntime.createClass)(CyclicDependencyError, {}, {}, $__super);
      }(ProviderError)));
      Object.defineProperty(CyclicDependencyError, "parameters", {get: function() {
          return [[Key]];
        }});
      InstantiationError = $__export("InstantiationError", (function($__super) {
        var InstantiationError = function InstantiationError(originalException, key) {
          assert.argumentTypes(originalException, $traceurRuntime.type.any, key, Key);
          $traceurRuntime.superConstructor(InstantiationError).call(this, key, function(keys) {
            assert.argumentTypes(keys, List);
            var first = stringify(ListWrapper.first(keys).token);
            return ("Error during instantiation of " + first + "!" + constructResolvingPath(keys) + ".") + (" ORIGINAL ERROR: " + originalException);
          });
        };
        return ($traceurRuntime.createClass)(InstantiationError, {}, {}, $__super);
      }(ProviderError)));
      Object.defineProperty(InstantiationError, "parameters", {get: function() {
          return [[], [Key]];
        }});
      InvalidBindingError = $__export("InvalidBindingError", (function($__super) {
        var InvalidBindingError = function InvalidBindingError(binding) {
          this.message = ("Invalid binding " + binding);
        };
        return ($traceurRuntime.createClass)(InvalidBindingError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(Error)));
      NoAnnotationError = $__export("NoAnnotationError", (function($__super) {
        var NoAnnotationError = function NoAnnotationError(typeOrFunc) {
          this.message = ("Cannot resolve all parameters for " + stringify(typeOrFunc));
        };
        return ($traceurRuntime.createClass)(NoAnnotationError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(Error)));
    }
  };
});




System.register("di/injector", ["rtts_assert/rtts_assert", "facade/collection", "./binding", "./exceptions", "facade/lang", "facade/async", "./key"], function($__export) {
  "use strict";
  var __moduleName = "di/injector";
  var assert,
      Map,
      List,
      MapWrapper,
      ListWrapper,
      Binding,
      BindingBuilder,
      bind,
      ProviderError,
      NoProviderError,
      InvalidBindingError,
      AsyncBindingError,
      CyclicDependencyError,
      InstantiationError,
      FunctionWrapper,
      Type,
      isPresent,
      isBlank,
      Promise,
      PromiseWrapper,
      Key,
      _constructing,
      _Waiting,
      Injector,
      _SyncInjectorStrategy,
      _AsyncInjectorStrategy;
  function _isWaiting(obj) {
    return assert.returnType((obj instanceof _Waiting), $traceurRuntime.type.boolean);
  }
  function _flattenBindings(bindings, res) {
    assert.argumentTypes(bindings, List, res, Map);
    ListWrapper.forEach(bindings, function(b) {
      if (b instanceof Binding) {
        MapWrapper.set(res, b.key.id, b);
      } else if (b instanceof Type) {
        var s = bind(b).toClass(b);
        MapWrapper.set(res, s.key.id, s);
      } else if (b instanceof List) {
        _flattenBindings(b, res);
      } else if (b instanceof BindingBuilder) {
        throw new InvalidBindingError(b.token);
      } else {
        throw new InvalidBindingError(b);
      }
    });
    return res;
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Map = m.Map;
      List = m.List;
      MapWrapper = m.MapWrapper;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      Binding = m.Binding;
      BindingBuilder = m.BindingBuilder;
      bind = m.bind;
    }, function(m) {
      ProviderError = m.ProviderError;
      NoProviderError = m.NoProviderError;
      InvalidBindingError = m.InvalidBindingError;
      AsyncBindingError = m.AsyncBindingError;
      CyclicDependencyError = m.CyclicDependencyError;
      InstantiationError = m.InstantiationError;
    }, function(m) {
      FunctionWrapper = m.FunctionWrapper;
      Type = m.Type;
      isPresent = m.isPresent;
      isBlank = m.isBlank;
    }, function(m) {
      Promise = m.Promise;
      PromiseWrapper = m.PromiseWrapper;
    }, function(m) {
      Key = m.Key;
    }],
    execute: function() {
      _constructing = new Object();
      _Waiting = (function() {
        var _Waiting = function _Waiting(promise) {
          assert.argumentTypes(promise, Promise);
          this.promise = promise;
        };
        return ($traceurRuntime.createClass)(_Waiting, {}, {});
      }());
      Object.defineProperty(_Waiting, "parameters", {get: function() {
          return [[Promise]];
        }});
      Injector = $__export("Injector", (function() {
        var Injector = function Injector(bindings) {
          var $__3,
              $__4;
          var $__2 = arguments[1] !== (void 0) ? arguments[1] : {},
              parent = ($__3 = $__2.parent) === void 0 ? null : $__3,
              defaultBindings = ($__4 = $__2.defaultBindings) === void 0 ? false : $__4;
          assert.argumentTypes(bindings, List);
          var flatten = _flattenBindings(bindings, MapWrapper.create());
          this._bindings = this._createListOfBindings(flatten);
          this._instances = this._createInstances();
          this._parent = parent;
          this._defaultBindings = defaultBindings;
          this._asyncStrategy = new _AsyncInjectorStrategy(this);
          this._syncStrategy = new _SyncInjectorStrategy(this);
        };
        return ($traceurRuntime.createClass)(Injector, {
          get: function(token) {
            return this._getByKey(Key.get(token), false, false);
          },
          asyncGet: function(token) {
            return this._getByKey(Key.get(token), true, false);
          },
          createChild: function(bindings) {
            assert.argumentTypes(bindings, List);
            return assert.returnType((new Injector(bindings, {parent: this})), Injector);
          },
          _createListOfBindings: function(flattenBindings) {
            var bindings = ListWrapper.createFixedSize(Key.numberOfKeys + 1);
            MapWrapper.forEach(flattenBindings, (function(v, keyId) {
              return bindings[keyId] = v;
            }));
            return assert.returnType((bindings), List);
          },
          _createInstances: function() {
            return assert.returnType((ListWrapper.createFixedSize(Key.numberOfKeys + 1)), List);
          },
          _getByKey: function(key, returnPromise, returnLazy) {
            var $__0 = this;
            if (returnLazy) {
              return (function() {
                return $__0._getByKey(key, returnPromise, false);
              });
            }
            var strategy = returnPromise ? this._asyncStrategy : this._syncStrategy;
            var instance = strategy.readFromCache(key);
            if (isPresent(instance))
              return instance;
            instance = strategy.instantiate(key);
            if (isPresent(instance))
              return instance;
            if (isPresent(this._parent)) {
              return this._parent._getByKey(key, returnPromise, returnLazy);
            }
            throw new NoProviderError(key);
          },
          _resolveDependencies: function(key, binding, forceAsync) {
            var $__0 = this;
            try {
              var getDependency = (function(d) {
                return $__0._getByKey(d.key, forceAsync || d.asPromise, d.lazy);
              });
              return assert.returnType((ListWrapper.map(binding.dependencies, getDependency)), List);
            } catch (e) {
              this._clear(key);
              if (e instanceof ProviderError)
                e.addKey(key);
              throw e;
            }
          },
          _getInstance: function(key) {
            assert.argumentTypes(key, Key);
            if (this._instances.length <= key.id)
              return null;
            return ListWrapper.get(this._instances, key.id);
          },
          _setInstance: function(key, obj) {
            assert.argumentTypes(key, Key, obj, $traceurRuntime.type.any);
            ListWrapper.set(this._instances, key.id, obj);
          },
          _getBinding: function(key) {
            assert.argumentTypes(key, Key);
            var binding = this._bindings.length <= key.id ? null : ListWrapper.get(this._bindings, key.id);
            if (isBlank(binding) && this._defaultBindings) {
              return bind(key.token).toClass(key.token);
            } else {
              return binding;
            }
          },
          _markAsConstructing: function(key) {
            assert.argumentTypes(key, Key);
            this._setInstance(key, _constructing);
          },
          _clear: function(key) {
            assert.argumentTypes(key, Key);
            this._setInstance(key, null);
          }
        }, {});
      }()));
      Object.defineProperty(Injector, "parameters", {get: function() {
          return [[List], []];
        }});
      Object.defineProperty(Injector.prototype.createChild, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(Injector.prototype._getByKey, "parameters", {get: function() {
          return [[Key], [$traceurRuntime.type.boolean], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(Injector.prototype._resolveDependencies, "parameters", {get: function() {
          return [[Key], [Binding], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(Injector.prototype._getInstance, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(Injector.prototype._setInstance, "parameters", {get: function() {
          return [[Key], []];
        }});
      Object.defineProperty(Injector.prototype._getBinding, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(Injector.prototype._markAsConstructing, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(Injector.prototype._clear, "parameters", {get: function() {
          return [[Key]];
        }});
      _SyncInjectorStrategy = (function() {
        var _SyncInjectorStrategy = function _SyncInjectorStrategy(injector) {
          assert.argumentTypes(injector, Injector);
          this.injector = injector;
        };
        return ($traceurRuntime.createClass)(_SyncInjectorStrategy, {
          readFromCache: function(key) {
            assert.argumentTypes(key, Key);
            if (key.token === Injector) {
              return this.injector;
            }
            var instance = this.injector._getInstance(key);
            if (instance === _constructing) {
              throw new CyclicDependencyError(key);
            } else if (isPresent(instance) && !_isWaiting(instance)) {
              return instance;
            } else {
              return null;
            }
          },
          instantiate: function(key) {
            assert.argumentTypes(key, Key);
            var binding = this.injector._getBinding(key);
            if (isBlank(binding))
              return null;
            if (binding.providedAsPromise)
              throw new AsyncBindingError(key);
            this.injector._markAsConstructing(key);
            var deps = this.injector._resolveDependencies(key, binding, false);
            return this._createInstance(key, binding, deps);
          },
          _createInstance: function(key, binding, deps) {
            assert.argumentTypes(key, Key, binding, Binding, deps, List);
            try {
              var instance = FunctionWrapper.apply(binding.factory, deps);
              this.injector._setInstance(key, instance);
              return instance;
            } catch (e) {
              this.injector._clear(key);
              throw new InstantiationError(e, key);
            }
          }
        }, {});
      }());
      Object.defineProperty(_SyncInjectorStrategy, "parameters", {get: function() {
          return [[Injector]];
        }});
      Object.defineProperty(_SyncInjectorStrategy.prototype.readFromCache, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(_SyncInjectorStrategy.prototype.instantiate, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(_SyncInjectorStrategy.prototype._createInstance, "parameters", {get: function() {
          return [[Key], [Binding], [List]];
        }});
      _AsyncInjectorStrategy = (function() {
        var _AsyncInjectorStrategy = function _AsyncInjectorStrategy(injector) {
          assert.argumentTypes(injector, Injector);
          this.injector = injector;
        };
        return ($traceurRuntime.createClass)(_AsyncInjectorStrategy, {
          readFromCache: function(key) {
            assert.argumentTypes(key, Key);
            if (key.token === Injector) {
              return PromiseWrapper.resolve(this.injector);
            }
            var instance = this.injector._getInstance(key);
            if (instance === _constructing) {
              throw new CyclicDependencyError(key);
            } else if (_isWaiting(instance)) {
              return instance.promise;
            } else if (isPresent(instance)) {
              return PromiseWrapper.resolve(instance);
            } else {
              return null;
            }
          },
          instantiate: function(key) {
            var $__0 = this;
            var binding = this.injector._getBinding(key);
            if (isBlank(binding))
              return null;
            this.injector._markAsConstructing(key);
            var deps = this.injector._resolveDependencies(key, binding, true);
            var depsPromise = PromiseWrapper.all(deps);
            var promise = PromiseWrapper.then(depsPromise, null, (function(e) {
              return $__0._errorHandler(key, e);
            })).then((function(deps) {
              return $__0._findOrCreate(key, binding, deps);
            })).then((function(instance) {
              return $__0._cacheInstance(key, instance);
            }));
            this.injector._setInstance(key, new _Waiting(promise));
            return promise;
          },
          _errorHandler: function(key, e) {
            assert.argumentTypes(key, Key, e, $traceurRuntime.type.any);
            if (e instanceof ProviderError)
              e.addKey(key);
            return assert.returnType((PromiseWrapper.reject(e)), Promise);
          },
          _findOrCreate: function(key, binding, deps) {
            assert.argumentTypes(key, Key, binding, Binding, deps, List);
            try {
              var instance = this.injector._getInstance(key);
              if (!_isWaiting(instance))
                return instance;
              return FunctionWrapper.apply(binding.factory, deps);
            } catch (e) {
              this.injector._clear(key);
              throw new InstantiationError(e, key);
            }
          },
          _cacheInstance: function(key, instance) {
            this.injector._setInstance(key, instance);
            return instance;
          }
        }, {});
      }());
      Object.defineProperty(_AsyncInjectorStrategy, "parameters", {get: function() {
          return [[Injector]];
        }});
      Object.defineProperty(_AsyncInjectorStrategy.prototype.readFromCache, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(_AsyncInjectorStrategy.prototype.instantiate, "parameters", {get: function() {
          return [[Key]];
        }});
      Object.defineProperty(_AsyncInjectorStrategy.prototype._errorHandler, "parameters", {get: function() {
          return [[Key], []];
        }});
      Object.defineProperty(_AsyncInjectorStrategy.prototype._findOrCreate, "parameters", {get: function() {
          return [[Key], [Binding], [List]];
        }});
      Object.defineProperty(_flattenBindings, "parameters", {get: function() {
          return [[List], [Map]];
        }});
    }
  };
});




System.register("di/key", ["rtts_assert/rtts_assert", "./exceptions", "facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "di/key";
  var assert,
      KeyMetadataError,
      MapWrapper,
      Map,
      FIELD,
      int,
      isPresent,
      Key,
      KeyRegistry,
      _globalKeyRegistry;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      KeyMetadataError = m.KeyMetadataError;
    }, function(m) {
      MapWrapper = m.MapWrapper;
      Map = m.Map;
    }, function(m) {
      FIELD = m.FIELD;
      int = m.int;
      isPresent = m.isPresent;
    }],
    execute: function() {
      Key = $__export("Key", (function() {
        var Key = function Key(token, id) {
          assert.argumentTypes(token, $traceurRuntime.type.any, id, int);
          this.token = token;
          this.id = id;
          this.metadata = null;
        };
        return ($traceurRuntime.createClass)(Key, {}, {
          setMetadata: function(key, metadata) {
            assert.argumentTypes(key, Key, metadata, $traceurRuntime.type.any);
            if (isPresent(key.metadata) && key.metadata !== metadata) {
              throw new KeyMetadataError();
            }
            key.metadata = metadata;
            return assert.returnType((key), Key);
          },
          get: function(token) {
            return assert.returnType((_globalKeyRegistry.get(token)), Key);
          },
          get numberOfKeys() {
            return assert.returnType((_globalKeyRegistry.numberOfKeys), int);
          }
        });
      }()));
      Object.defineProperty(Key, "parameters", {get: function() {
          return [[], [int]];
        }});
      Object.defineProperty(Key.setMetadata, "parameters", {get: function() {
          return [[Key], []];
        }});
      KeyRegistry = $__export("KeyRegistry", (function() {
        var KeyRegistry = function KeyRegistry() {
          this._allKeys = MapWrapper.create();
        };
        return ($traceurRuntime.createClass)(KeyRegistry, {
          get: function(token) {
            if (token instanceof Key)
              return assert.returnType((token), Key);
            if (MapWrapper.contains(this._allKeys, token)) {
              return assert.returnType((MapWrapper.get(this._allKeys, token)), Key);
            }
            var newKey = new Key(token, Key.numberOfKeys);
            MapWrapper.set(this._allKeys, token, newKey);
            return assert.returnType((newKey), Key);
          },
          get numberOfKeys() {
            return assert.returnType((MapWrapper.size(this._allKeys)), int);
          }
        }, {});
      }()));
      _globalKeyRegistry = new KeyRegistry();
    }
  };
});




System.register("di/opaque_token", ["rtts_assert/rtts_assert"], function($__export) {
  "use strict";
  var __moduleName = "di/opaque_token";
  var assert,
      OpaqueToken;
  return {
    setters: [function(m) {
      assert = m.assert;
    }],
    execute: function() {
      OpaqueToken = $__export("OpaqueToken", (function() {
        var OpaqueToken = function OpaqueToken(desc) {
          assert.argumentTypes(desc, $traceurRuntime.type.string);
          this._desc = ("Token(" + desc + ")");
        };
        return ($traceurRuntime.createClass)(OpaqueToken, {toString: function() {
            return this._desc;
          }}, {});
      }()));
      Object.defineProperty(OpaqueToken, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("directives/directives", ["./ng_if", "./ng_non_bindable", "./ng_repeat", "./ng_switch"], function($__export) {
  "use strict";
  var __moduleName = "directives/directives";
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  return {
    setters: [function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }],
    execute: function() {}
  };
});




System.register("directives/ng_if", ["rtts_assert/rtts_assert", "core/annotations/annotations", "core/compiler/interfaces", "core/compiler/viewport", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "directives/ng_if";
  var assert,
      Template,
      OnChange,
      ViewPort,
      isBlank,
      NgIf;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Template = m.Template;
    }, function(m) {
      OnChange = m.OnChange;
    }, function(m) {
      ViewPort = m.ViewPort;
    }, function(m) {
      isBlank = m.isBlank;
    }],
    execute: function() {
      NgIf = $__export("NgIf", (function() {
        var NgIf = function NgIf(viewPort) {
          assert.argumentTypes(viewPort, ViewPort);
          this.viewPort = viewPort;
          this.prevCondition = null;
        };
        return ($traceurRuntime.createClass)(NgIf, {set condition(newCondition) {
            if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
              this.prevCondition = true;
              this.viewPort.create();
            } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
              this.prevCondition = false;
              this.viewPort.clear();
            }
          }}, {});
      }()));
      Object.defineProperty(NgIf, "annotations", {get: function() {
          return [new Template({
            selector: '[ng-if]',
            bind: {'ng-if': 'condition'}
          })];
        }});
      Object.defineProperty(NgIf, "parameters", {get: function() {
          return [[ViewPort]];
        }});
    }
  };
});




System.register("directives/ng_non_bindable", ["core/annotations/annotations"], function($__export) {
  "use strict";
  var __moduleName = "directives/ng_non_bindable";
  var Decorator,
      NgNonBindable;
  return {
    setters: [function(m) {
      Decorator = m.Decorator;
    }],
    execute: function() {
      NgNonBindable = $__export("NgNonBindable", (function() {
        var NgNonBindable = function NgNonBindable() {};
        return ($traceurRuntime.createClass)(NgNonBindable, {}, {});
      }()));
      Object.defineProperty(NgNonBindable, "annotations", {get: function() {
          return [new Decorator({
            selector: '[ng-non-bindable]',
            compileChildren: false
          })];
        }});
    }
  };
});




System.register("directives/ng_repeat", ["rtts_assert/rtts_assert", "core/annotations/annotations", "core/compiler/interfaces", "core/compiler/viewport", "core/compiler/view", "facade/lang", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "directives/ng_repeat";
  var assert,
      Template,
      OnChange,
      ViewPort,
      View,
      isPresent,
      isBlank,
      ListWrapper,
      NgRepeat,
      RecordViewTuple;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Template = m.Template;
    }, function(m) {
      OnChange = m.OnChange;
    }, function(m) {
      ViewPort = m.ViewPort;
    }, function(m) {
      View = m.View;
    }, function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
    }, function(m) {
      ListWrapper = m.ListWrapper;
    }],
    execute: function() {
      NgRepeat = $__export("NgRepeat", (function($__super) {
        var NgRepeat = function NgRepeat(viewPort) {
          assert.argumentTypes(viewPort, ViewPort);
          this.viewPort = viewPort;
        };
        return ($traceurRuntime.createClass)(NgRepeat, {
          onChange: function(changes) {
            var iteratorChanges = changes['iterable'];
            if (isBlank(iteratorChanges) || isBlank(iteratorChanges.currentValue)) {
              this.viewPort.clear();
              return ;
            }
            var recordViewTuples = [];
            iteratorChanges.currentValue.forEachRemovedItem((function(removedRecord) {
              return ListWrapper.push(recordViewTuples, new RecordViewTuple(removedRecord, null));
            }));
            iteratorChanges.currentValue.forEachMovedItem((function(movedRecord) {
              return ListWrapper.push(recordViewTuples, new RecordViewTuple(movedRecord, null));
            }));
            var insertTuples = NgRepeat.bulkRemove(recordViewTuples, this.viewPort);
            iteratorChanges.currentValue.forEachAddedItem((function(addedRecord) {
              return ListWrapper.push(insertTuples, new RecordViewTuple(addedRecord, null));
            }));
            NgRepeat.bulkInsert(insertTuples, this.viewPort);
            for (var i = 0; i < insertTuples.length; i++) {
              this.perViewChange(insertTuples[i].view, insertTuples[i].record);
            }
          },
          perViewChange: function(view, record) {
            view.setLocal('ng-repeat', record.item);
          }
        }, {
          bulkRemove: function(tuples, viewPort) {
            tuples.sort((function(a, b) {
              return a.record.previousIndex - b.record.previousIndex;
            }));
            var movedTuples = [];
            for (var i = tuples.length - 1; i >= 0; i--) {
              var tuple = tuples[i];
              if (isPresent(tuple.record.currentIndex)) {
                tuple.view = viewPort.detach(tuple.record.previousIndex);
                ListWrapper.push(movedTuples, tuple);
              } else {
                viewPort.remove(tuple.record.previousIndex);
              }
            }
            return movedTuples;
          },
          bulkInsert: function(tuples, viewPort) {
            tuples.sort((function(a, b) {
              return a.record.currentIndex - b.record.currentIndex;
            }));
            for (var i = 0; i < tuples.length; i++) {
              var tuple = tuples[i];
              if (isPresent(tuple.view)) {
                viewPort.insert(tuple.view, tuple.record.currentIndex);
              } else {
                tuple.view = viewPort.create(tuple.record.currentIndex);
              }
            }
            return tuples;
          }
        }, $__super);
      }(OnChange)));
      Object.defineProperty(NgRepeat, "annotations", {get: function() {
          return [new Template({
            selector: '[ng-repeat]',
            bind: {'in': 'iterable[]'}
          })];
        }});
      Object.defineProperty(NgRepeat, "parameters", {get: function() {
          return [[ViewPort]];
        }});
      RecordViewTuple = (function() {
        var RecordViewTuple = function RecordViewTuple(record, view) {
          this.record = record;
          this.view = view;
        };
        return ($traceurRuntime.createClass)(RecordViewTuple, {}, {});
      }());
    }
  };
});




System.register("directives/ng_switch", ["rtts_assert/rtts_assert", "core/annotations/annotations", "core/compiler/viewport", "core/dom/element", "facade/dom", "facade/lang", "facade/collection", "core/annotations/visibility"], function($__export) {
  "use strict";
  var __moduleName = "directives/ng_switch";
  var assert,
      Decorator,
      Template,
      ViewPort,
      NgElement,
      DOM,
      isPresent,
      isBlank,
      ListWrapper,
      List,
      MapWrapper,
      Map,
      Parent,
      NgSwitch,
      NgSwitchWhen,
      NgSwitchDefault,
      _whenDefault;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Decorator = m.Decorator;
      Template = m.Template;
    }, function(m) {
      ViewPort = m.ViewPort;
    }, function(m) {
      NgElement = m.NgElement;
    }, function(m) {
      DOM = m.DOM;
    }, function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      List = m.List;
      MapWrapper = m.MapWrapper;
      Map = m.Map;
    }, function(m) {
      Parent = m.Parent;
    }],
    execute: function() {
      NgSwitch = $__export("NgSwitch", (function() {
        var NgSwitch = function NgSwitch() {
          this._valueViewPorts = MapWrapper.create();
          this._activeViewPorts = ListWrapper.create();
          this._useDefault = false;
        };
        return ($traceurRuntime.createClass)(NgSwitch, {
          set value(value) {
            this._removeAllActiveViewPorts();
            this._useDefault = false;
            var viewPorts = MapWrapper.get(this._valueViewPorts, value);
            if (isBlank(viewPorts)) {
              this._useDefault = true;
              viewPorts = MapWrapper.get(this._valueViewPorts, _whenDefault);
            }
            this._activateViewPorts(viewPorts);
            this._switchValue = value;
          },
          _onWhenValueChanged: function(oldWhen, newWhen, viewPort) {
            assert.argumentTypes(oldWhen, $traceurRuntime.type.any, newWhen, $traceurRuntime.type.any, viewPort, ViewPort);
            this._deregisterViewPort(oldWhen, viewPort);
            this._registerViewPort(newWhen, viewPort);
            if (oldWhen === this._switchValue) {
              viewPort.remove();
              ListWrapper.remove(this._activeViewPorts, viewPort);
            } else if (newWhen === this._switchValue) {
              if (this._useDefault) {
                this._useDefault = false;
                this._removeAllActiveViewPorts();
              }
              viewPort.create();
              ListWrapper.push(this._activeViewPorts, viewPort);
            }
            if (this._activeViewPorts.length === 0 && !this._useDefault) {
              this._useDefault = true;
              this._activateViewPorts(MapWrapper.get(this._valueViewPorts, _whenDefault));
            }
          },
          _removeAllActiveViewPorts: function() {
            var activeViewPorts = this._activeViewPorts;
            for (var i = 0; i < activeViewPorts.length; i++) {
              activeViewPorts[i].remove();
            }
            this._activeViewPorts = ListWrapper.create();
          },
          _activateViewPorts: function(viewPorts) {
            if (isPresent(viewPorts)) {
              for (var i = 0; i < viewPorts.length; i++) {
                viewPorts[i].create();
              }
              this._activeViewPorts = viewPorts;
            }
          },
          _registerViewPort: function(value, viewPort) {
            assert.argumentTypes(value, $traceurRuntime.type.any, viewPort, ViewPort);
            var viewPorts = MapWrapper.get(this._valueViewPorts, value);
            if (isBlank(viewPorts)) {
              viewPorts = ListWrapper.create();
              MapWrapper.set(this._valueViewPorts, value, viewPorts);
            }
            ListWrapper.push(viewPorts, viewPort);
          },
          _deregisterViewPort: function(value, viewPort) {
            assert.argumentTypes(value, $traceurRuntime.type.any, viewPort, ViewPort);
            if (value == _whenDefault)
              return ;
            var viewPorts = MapWrapper.get(this._valueViewPorts, value);
            if (viewPorts.length == 1) {
              MapWrapper.delete(this._valueViewPorts, value);
            } else {
              ListWrapper.remove(viewPorts, viewPort);
            }
          }
        }, {});
      }()));
      Object.defineProperty(NgSwitch, "annotations", {get: function() {
          return [new Decorator({
            selector: '[ng-switch]',
            bind: {'ng-switch': 'value'}
          })];
        }});
      Object.defineProperty(NgSwitch.prototype._onWhenValueChanged, "parameters", {get: function() {
          return [[], [], [ViewPort]];
        }});
      Object.defineProperty(NgSwitch.prototype._registerViewPort, "parameters", {get: function() {
          return [[], [ViewPort]];
        }});
      Object.defineProperty(NgSwitch.prototype._deregisterViewPort, "parameters", {get: function() {
          return [[], [ViewPort]];
        }});
      NgSwitchWhen = $__export("NgSwitchWhen", (function() {
        var NgSwitchWhen = function NgSwitchWhen(el, viewPort, ngSwitch) {
          assert.argumentTypes(el, NgElement, viewPort, ViewPort, ngSwitch, NgSwitch);
          this._value = _whenDefault;
          this._ngSwitch = ngSwitch;
          this._viewPort = viewPort;
        };
        return ($traceurRuntime.createClass)(NgSwitchWhen, {set when(value) {
            this._ngSwitch._onWhenValueChanged(this._value, value, this._viewPort);
            this._value = value;
          }}, {});
      }()));
      Object.defineProperty(NgSwitchWhen, "annotations", {get: function() {
          return [new Template({
            selector: '[ng-switch-when]',
            bind: {'ng-switch-when': 'when'}
          })];
        }});
      Object.defineProperty(NgSwitchWhen, "parameters", {get: function() {
          return [[NgElement], [ViewPort], [NgSwitch, new Parent()]];
        }});
      NgSwitchDefault = $__export("NgSwitchDefault", (function() {
        var NgSwitchDefault = function NgSwitchDefault(viewPort, ngSwitch) {
          assert.argumentTypes(viewPort, ViewPort, ngSwitch, NgSwitch);
          ngSwitch._registerViewPort(_whenDefault, viewPort);
        };
        return ($traceurRuntime.createClass)(NgSwitchDefault, {}, {});
      }()));
      Object.defineProperty(NgSwitchDefault, "annotations", {get: function() {
          return [new Template({selector: '[ng-switch-default]'})];
        }});
      Object.defineProperty(NgSwitchDefault, "parameters", {get: function() {
          return [[ViewPort], [NgSwitch, new Parent()]];
        }});
      _whenDefault = new Object();
    }
  };
});




System.register("facade/async", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "facade/async";
  var assert,
      int,
      List,
      Promise,
      PromiseWrapper;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      int = m.int;
    }, function(m) {
      List = m.List;
    }],
    execute: function() {
      Promise = $__export("Promise", window.Promise);
      PromiseWrapper = $__export("PromiseWrapper", (function() {
        var PromiseWrapper = function PromiseWrapper() {};
        return ($traceurRuntime.createClass)(PromiseWrapper, {}, {
          resolve: function(obj) {
            return assert.returnType((Promise.resolve(obj)), Promise);
          },
          reject: function(obj) {
            return assert.returnType((Promise.reject(obj)), Promise);
          },
          all: function(promises) {
            assert.argumentTypes(promises, List);
            if (promises.length == 0)
              return assert.returnType((Promise.resolve([])), Promise);
            return assert.returnType((Promise.all(promises)), Promise);
          },
          then: function(promise, success, rejection) {
            assert.argumentTypes(promise, Promise, success, Function, rejection, Function);
            return assert.returnType((promise.then(success, rejection)), Promise);
          },
          completer: function() {
            var resolve;
            var reject;
            var p = new Promise(function(res, rej) {
              resolve = res;
              reject = rej;
            });
            return {
              promise: p,
              complete: resolve,
              reject: reject
            };
          },
          setTimeout: function(fn, millis) {
            assert.argumentTypes(fn, Function, millis, int);
            window.setTimeout(fn, millis);
          }
        });
      }()));
      Object.defineProperty(PromiseWrapper.all, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(PromiseWrapper.then, "parameters", {get: function() {
          return [[Promise], [Function], [Function]];
        }});
      Object.defineProperty(PromiseWrapper.setTimeout, "parameters", {get: function() {
          return [[Function], [int]];
        }});
    }
  };
});




System.register("facade/collection", ["rtts_assert/rtts_assert", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "facade/collection";
  var assert,
      int,
      isJsObject,
      List,
      Map,
      Set,
      MapWrapper,
      StringMapWrapper,
      ListWrapper,
      SetWrapper;
  function isListLikeIterable(obj) {
    if (!isJsObject(obj))
      return assert.returnType((false), $traceurRuntime.type.boolean);
    return assert.returnType((ListWrapper.isList(obj) || (!(obj instanceof Map) && Symbol.iterator in obj)), $traceurRuntime.type.boolean);
  }
  function iterateListLike(obj, fn) {
    assert.argumentTypes(obj, $traceurRuntime.type.any, fn, Function);
    for (var $__1 = obj[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__2 = void 0; !($__2 = $__1.next()).done; ) {
      var item = $__2.value;
      {
        fn(item);
      }
    }
  }
  $__export("isListLikeIterable", isListLikeIterable);
  $__export("iterateListLike", iterateListLike);
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      int = m.int;
      isJsObject = m.isJsObject;
    }],
    execute: function() {
      List = $__export("List", window.Array);
      Map = $__export("Map", window.Map);
      Set = $__export("Set", window.Set);
      MapWrapper = $__export("MapWrapper", (function() {
        var MapWrapper = function MapWrapper() {};
        return ($traceurRuntime.createClass)(MapWrapper, {}, {
          create: function() {
            return assert.returnType((new Map()), Map);
          },
          clone: function(m) {
            assert.argumentTypes(m, Map);
            return assert.returnType((new Map(m)), Map);
          },
          createFromStringMap: function(stringMap) {
            var result = MapWrapper.create();
            for (var prop = void 0 in stringMap) {
              MapWrapper.set(result, prop, stringMap[prop]);
            }
            return assert.returnType((result), Map);
          },
          createFromPairs: function(pairs) {
            assert.argumentTypes(pairs, List);
            return assert.returnType((new Map(pairs)), Map);
          },
          get: function(m, k) {
            return m.get(k);
          },
          set: function(m, k, v) {
            m.set(k, v);
          },
          contains: function(m, k) {
            return m.has(k);
          },
          forEach: function(m, fn) {
            m.forEach(fn);
          },
          size: function(m) {
            return m.size;
          },
          delete: function(m, k) {
            m.delete(k);
          },
          clear: function(m) {
            m.clear();
          },
          iterable: function(m) {
            return m;
          },
          keys: function(m) {
            return m.keys();
          },
          values: function(m) {
            return m.values();
          }
        });
      }()));
      Object.defineProperty(MapWrapper.clone, "parameters", {get: function() {
          return [[Map]];
        }});
      Object.defineProperty(MapWrapper.createFromPairs, "parameters", {get: function() {
          return [[List]];
        }});
      StringMapWrapper = $__export("StringMapWrapper", (function() {
        var StringMapWrapper = function StringMapWrapper() {};
        return ($traceurRuntime.createClass)(StringMapWrapper, {}, {
          create: function() {
            return assert.returnType(({}), Object);
          },
          get: function(map, key) {
            return map.hasOwnProperty(key) ? map[key] : undefined;
          },
          set: function(map, key, value) {
            map[key] = value;
          },
          isEmpty: function(map) {
            for (var prop = void 0 in map) {
              return false;
            }
            return true;
          },
          forEach: function(map, callback) {
            for (var prop = void 0 in map) {
              if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
              }
            }
          },
          merge: function(m1, m2) {
            var m = {};
            for (var attr = void 0 in m1) {
              if (m1.hasOwnProperty(attr)) {
                m[attr] = m1[attr];
              }
            }
            for (var attr = void 0 in m2) {
              if (m2.hasOwnProperty(attr)) {
                m[attr] = m2[attr];
              }
            }
            return m;
          }
        });
      }()));
      ListWrapper = $__export("ListWrapper", (function() {
        var ListWrapper = function ListWrapper() {};
        return ($traceurRuntime.createClass)(ListWrapper, {}, {
          create: function() {
            return assert.returnType((new List()), List);
          },
          createFixedSize: function(size) {
            return assert.returnType((new List(size)), List);
          },
          get: function(m, k) {
            return m[k];
          },
          set: function(m, k, v) {
            m[k] = v;
          },
          clone: function(array) {
            assert.argumentTypes(array, List);
            return array.slice(0);
          },
          map: function(array, fn) {
            return array.map(fn);
          },
          forEach: function(array, fn) {
            for (var $__1 = array[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__2 = void 0; !($__2 = $__1.next()).done; ) {
              var p = $__2.value;
              {
                fn(p);
              }
            }
          },
          push: function(array, el) {
            array.push(el);
          },
          first: function(array) {
            if (!array)
              return null;
            return array[0];
          },
          last: function(array) {
            if (!array || array.length == 0)
              return null;
            return array[array.length - 1];
          },
          find: function(list, pred) {
            assert.argumentTypes(list, List, pred, Function);
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return list[i];
            }
            return null;
          },
          reduce: function(list, fn, init) {
            assert.argumentTypes(list, List, fn, Function, init, $traceurRuntime.type.any);
            return list.reduce(fn, init);
          },
          filter: function(array, pred) {
            assert.argumentTypes(array, $traceurRuntime.type.any, pred, Function);
            return array.filter(pred);
          },
          any: function(list, pred) {
            assert.argumentTypes(list, List, pred, Function);
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return true;
            }
            return false;
          },
          contains: function(list, el) {
            assert.argumentTypes(list, List, el, $traceurRuntime.type.any);
            return list.indexOf(el) !== -1;
          },
          reversed: function(array) {
            var a = ListWrapper.clone(array);
            return a.reverse();
          },
          concat: function(a, b) {
            return a.concat(b);
          },
          isList: function(list) {
            return Array.isArray(list);
          },
          insert: function(list, index, value) {
            assert.argumentTypes(list, $traceurRuntime.type.any, index, int, value, $traceurRuntime.type.any);
            list.splice(index, 0, value);
          },
          removeAt: function(list, index) {
            assert.argumentTypes(list, $traceurRuntime.type.any, index, int);
            var res = list[index];
            list.splice(index, 1);
            return res;
          },
          removeAll: function(list, items) {
            for (var i = 0; i < items.length; ++i) {
              var index = list.indexOf(items[i]);
              list.splice(index, 1);
            }
          },
          remove: function(list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
              list.splice(index, 1);
              return assert.returnType((true), $traceurRuntime.type.boolean);
            }
            return assert.returnType((false), $traceurRuntime.type.boolean);
          },
          clear: function(list) {
            list.splice(0, list.length);
          },
          join: function(list, s) {
            return list.join(s);
          },
          isEmpty: function(list) {
            return list.length == 0;
          },
          fill: function(list, value) {
            var start = arguments[2] !== (void 0) ? arguments[2] : 0;
            var end = arguments[3];
            assert.argumentTypes(list, List, value, $traceurRuntime.type.any, start, int, end, int);
            list.fill(value, start, end);
          }
        });
      }()));
      Object.defineProperty(ListWrapper.clone, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(ListWrapper.find, "parameters", {get: function() {
          return [[List], [Function]];
        }});
      Object.defineProperty(ListWrapper.reduce, "parameters", {get: function() {
          return [[List], [Function], []];
        }});
      Object.defineProperty(ListWrapper.filter, "parameters", {get: function() {
          return [[], [Function]];
        }});
      Object.defineProperty(ListWrapper.any, "parameters", {get: function() {
          return [[List], [Function]];
        }});
      Object.defineProperty(ListWrapper.contains, "parameters", {get: function() {
          return [[List], []];
        }});
      Object.defineProperty(ListWrapper.insert, "parameters", {get: function() {
          return [[], [int], []];
        }});
      Object.defineProperty(ListWrapper.removeAt, "parameters", {get: function() {
          return [[], [int]];
        }});
      Object.defineProperty(ListWrapper.fill, "parameters", {get: function() {
          return [[List], [], [int], [int]];
        }});
      Object.defineProperty(iterateListLike, "parameters", {get: function() {
          return [[], [Function]];
        }});
      SetWrapper = $__export("SetWrapper", (function() {
        var SetWrapper = function SetWrapper() {};
        return ($traceurRuntime.createClass)(SetWrapper, {}, {
          createFromList: function(lst) {
            assert.argumentTypes(lst, List);
            return new Set(lst);
          },
          has: function(s, key) {
            assert.argumentTypes(s, Set, key, $traceurRuntime.type.any);
            return assert.returnType((s.has(key)), $traceurRuntime.type.boolean);
          }
        });
      }()));
      Object.defineProperty(SetWrapper.createFromList, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(SetWrapper.has, "parameters", {get: function() {
          return [[Set], []];
        }});
    }
  };
});




System.register("facade/dom", ["rtts_assert/rtts_assert", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "facade/dom";
  var assert,
      window,
      DocumentFragment,
      Node,
      NodeList,
      Text,
      Element,
      TemplateElement,
      document,
      location,
      gc,
      List,
      MapWrapper,
      ListWrapper,
      DOM;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      List = m.List;
      MapWrapper = m.MapWrapper;
      ListWrapper = m.ListWrapper;
    }],
    execute: function() {
      window = $__export("window", frames.window);
      DocumentFragment = $__export("DocumentFragment", window.DocumentFragment);
      Node = $__export("Node", window.Node);
      NodeList = $__export("NodeList", window.NodeList);
      Text = $__export("Text", window.Text);
      Element = $__export("Element", window.HTMLElement);
      TemplateElement = $__export("TemplateElement", window.HTMLTemplateElement);
      document = $__export("document", window.document);
      location = $__export("location", window.location);
      gc = $__export("gc", window.gc ? (function() {
        return window.gc();
      }) : (function() {
        return null;
      }));
      DOM = $__export("DOM", (function() {
        var DOM = function DOM() {};
        return ($traceurRuntime.createClass)(DOM, {}, {
          query: function(selector) {
            return document.querySelector(selector);
          },
          querySelector: function(el, selector) {
            assert.argumentTypes(el, $traceurRuntime.type.any, selector, $traceurRuntime.type.string);
            return assert.returnType((el.querySelector(selector)), Node);
          },
          querySelectorAll: function(el, selector) {
            assert.argumentTypes(el, $traceurRuntime.type.any, selector, $traceurRuntime.type.string);
            return assert.returnType((el.querySelectorAll(selector)), NodeList);
          },
          on: function(el, evt, listener) {
            el.addEventListener(evt, listener, false);
          },
          dispatchEvent: function(el, evt) {
            el.dispatchEvent(evt);
          },
          createMouseEvent: function(eventType) {
            var evt = new MouseEvent(eventType);
            evt.initEvent(eventType, true, true);
            return evt;
          },
          getInnerHTML: function(el) {
            return el.innerHTML;
          },
          getOuterHTML: function(el) {
            return el.outerHTML;
          },
          firstChild: function(el) {
            return assert.returnType((el.firstChild), Node);
          },
          nextSibling: function(el) {
            return assert.returnType((el.nextSibling), Node);
          },
          parentElement: function(el) {
            return el.parentElement;
          },
          childNodes: function(el) {
            return assert.returnType((el.childNodes), NodeList);
          },
          childNodesAsList: function(el) {
            var childNodes = el.childNodes;
            var res = ListWrapper.createFixedSize(childNodes.length);
            for (var i = 0; i < childNodes.length; i++) {
              res[i] = childNodes[i];
            }
            return assert.returnType((res), List);
          },
          clearNodes: function(el) {
            el.innerHTML = "";
          },
          appendChild: function(el, node) {
            el.appendChild(node);
          },
          removeChild: function(el, node) {
            el.removeChild(node);
          },
          insertBefore: function(el, node) {
            el.parentNode.insertBefore(node, el);
          },
          insertAllBefore: function(el, nodes) {
            ListWrapper.forEach(nodes, (function(n) {
              el.parentNode.insertBefore(n, el);
            }));
          },
          insertAfter: function(el, node) {
            el.parentNode.insertBefore(node, el.nextSibling);
          },
          setInnerHTML: function(el, value) {
            el.innerHTML = value;
          },
          getText: function(el) {
            assert.argumentTypes(el, Element);
            return el.textContent;
          },
          setText: function(text, value) {
            assert.argumentTypes(text, Text, value, $traceurRuntime.type.string);
            text.nodeValue = value;
          },
          createTemplate: function(html) {
            var t = document.createElement('template');
            t.innerHTML = html;
            return t;
          },
          createElement: function(tagName) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : document;
            return doc.createElement(tagName);
          },
          createScriptTag: function(attrName, attrValue) {
            var doc = arguments[2] !== (void 0) ? arguments[2] : document;
            assert.argumentTypes(attrName, $traceurRuntime.type.string, attrValue, $traceurRuntime.type.string, doc, $traceurRuntime.type.any);
            var el = doc.createElement("SCRIPT");
            el.setAttribute(attrName, attrValue);
            return el;
          },
          clone: function(node) {
            assert.argumentTypes(node, Node);
            return node.cloneNode(true);
          },
          hasProperty: function(element, name) {
            assert.argumentTypes(element, Element, name, $traceurRuntime.type.string);
            return name in element;
          },
          getElementsByClassName: function(element, name) {
            assert.argumentTypes(element, Element, name, $traceurRuntime.type.string);
            return element.getElementsByClassName(name);
          },
          getElementsByTagName: function(element, name) {
            assert.argumentTypes(element, Element, name, $traceurRuntime.type.string);
            return element.getElementsByTagName(name);
          },
          classList: function(element) {
            assert.argumentTypes(element, Element);
            return assert.returnType((Array.prototype.slice.call(element.classList, 0)), List);
          },
          addClass: function(element, classname) {
            assert.argumentTypes(element, Element, classname, $traceurRuntime.type.string);
            element.classList.add(classname);
          },
          hasClass: function(element, classname) {
            assert.argumentTypes(element, Element, classname, $traceurRuntime.type.string);
            return element.classList.contains(classname);
          },
          tagName: function(element) {
            assert.argumentTypes(element, Element);
            return assert.returnType((element.tagName), $traceurRuntime.type.string);
          },
          attributeMap: function(element) {
            assert.argumentTypes(element, Element);
            var res = MapWrapper.create();
            var elAttrs = element.attributes;
            for (var i = 0; i < elAttrs.length; i++) {
              var attrib = elAttrs[i];
              MapWrapper.set(res, attrib.name, attrib.value);
            }
            return res;
          },
          getAttribute: function(element, attribute) {
            assert.argumentTypes(element, Element, attribute, $traceurRuntime.type.string);
            return element.getAttribute(attribute);
          },
          templateAwareRoot: function(el) {
            assert.argumentTypes(el, Element);
            return assert.returnType((el instanceof TemplateElement ? el.content : el), Node);
          },
          createHtmlDocument: function() {
            return document.implementation.createHTMLDocument();
          },
          defaultDoc: function() {
            return document;
          },
          elementMatches: function(n, selector) {
            assert.argumentTypes(n, $traceurRuntime.type.any, selector, $traceurRuntime.type.string);
            return assert.returnType((n instanceof Element && n.matches(selector)), $traceurRuntime.type.boolean);
          }
        });
      }()));
      Object.defineProperty(DOM.querySelector, "parameters", {get: function() {
          return [[], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.querySelectorAll, "parameters", {get: function() {
          return [[], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.getText, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(DOM.setText, "parameters", {get: function() {
          return [[Text], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.createScriptTag, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string], []];
        }});
      Object.defineProperty(DOM.clone, "parameters", {get: function() {
          return [[Node]];
        }});
      Object.defineProperty(DOM.hasProperty, "parameters", {get: function() {
          return [[Element], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.getElementsByClassName, "parameters", {get: function() {
          return [[Element], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.getElementsByTagName, "parameters", {get: function() {
          return [[Element], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.classList, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(DOM.addClass, "parameters", {get: function() {
          return [[Element], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.hasClass, "parameters", {get: function() {
          return [[Element], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.tagName, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(DOM.attributeMap, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(DOM.getAttribute, "parameters", {get: function() {
          return [[Element], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(DOM.templateAwareRoot, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(DOM.elementMatches, "parameters", {get: function() {
          return [[], [$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("facade/lang", ["rtts_assert/rtts_assert"], function($__export) {
  "use strict";
  var __moduleName = "facade/lang";
  var assert,
      Type,
      Math,
      FIELD,
      CONST,
      ABSTRACT,
      IMPLEMENTS,
      StringWrapper,
      StringJoiner,
      NumberParseError,
      NumberWrapper,
      RegExp,
      RegExpWrapper,
      RegExpMatcherWrapper,
      FunctionWrapper,
      BaseException;
  function isPresent(obj) {
    return assert.returnType((obj !== undefined && obj !== null), $traceurRuntime.type.boolean);
  }
  function isBlank(obj) {
    return assert.returnType((obj === undefined || obj === null), $traceurRuntime.type.boolean);
  }
  function stringify(token) {
    if (typeof token === 'string') {
      return assert.returnType((token), $traceurRuntime.type.string);
    }
    if (token === undefined || token === null) {
      return assert.returnType(('' + token), $traceurRuntime.type.string);
    }
    if (token.name) {
      return assert.returnType((token.name), $traceurRuntime.type.string);
    }
    return assert.returnType((token.toString()), $traceurRuntime.type.string);
  }
  function int() {}
  function looseIdentical(a, b) {
    return assert.returnType((a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)), $traceurRuntime.type.boolean);
  }
  function getMapKey(value) {
    return value;
  }
  function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
  }
  function isJsObject(o) {
    return assert.returnType((o !== null && (typeof o === "function" || typeof o === "object")), $traceurRuntime.type.boolean);
  }
  function assertionsEnabled() {
    try {
      var x = assert.type("string", int);
      return assert.returnType((false), $traceurRuntime.type.boolean);
    } catch (e) {
      return assert.returnType((true), $traceurRuntime.type.boolean);
    }
  }
  function print(obj) {
    console.log(obj);
  }
  $__export("isPresent", isPresent);
  $__export("isBlank", isBlank);
  $__export("stringify", stringify);
  $__export("int", int);
  $__export("looseIdentical", looseIdentical);
  $__export("getMapKey", getMapKey);
  $__export("normalizeBlank", normalizeBlank);
  $__export("isJsObject", isJsObject);
  $__export("assertionsEnabled", assertionsEnabled);
  $__export("print", print);
  return {
    setters: [function(m) {
      assert = m.assert;
      assert = m.assert;
      $__export("proxy", m.proxy);
    }],
    execute: function() {
      Type = $__export("Type", Function);
      Math = $__export("Math", window.Math);
      window.assert = assert;
      FIELD = $__export("FIELD", (function() {
        var FIELD = function FIELD(definition) {
          this.definition = definition;
        };
        return ($traceurRuntime.createClass)(FIELD, {}, {});
      }()));
      CONST = $__export("CONST", (function() {
        var CONST = function CONST() {};
        return ($traceurRuntime.createClass)(CONST, {}, {});
      }()));
      ABSTRACT = $__export("ABSTRACT", (function() {
        var ABSTRACT = function ABSTRACT() {};
        return ($traceurRuntime.createClass)(ABSTRACT, {}, {});
      }()));
      IMPLEMENTS = $__export("IMPLEMENTS", (function() {
        var IMPLEMENTS = function IMPLEMENTS() {};
        return ($traceurRuntime.createClass)(IMPLEMENTS, {}, {});
      }()));
      StringWrapper = $__export("StringWrapper", (function() {
        var StringWrapper = function StringWrapper() {};
        return ($traceurRuntime.createClass)(StringWrapper, {}, {
          fromCharCode: function(code) {
            assert.argumentTypes(code, int);
            return assert.returnType((String.fromCharCode(code)), $traceurRuntime.type.string);
          },
          charCodeAt: function(s, index) {
            assert.argumentTypes(s, $traceurRuntime.type.string, index, int);
            return s.charCodeAt(index);
          },
          split: function(s, regExp) {
            assert.argumentTypes(s, $traceurRuntime.type.string, regExp, RegExp);
            return s.split(regExp.multiple);
          },
          equals: function(s, s2) {
            assert.argumentTypes(s, $traceurRuntime.type.string, s2, $traceurRuntime.type.string);
            return assert.returnType((s === s2), $traceurRuntime.type.boolean);
          },
          replaceAll: function(s, from, replace) {
            assert.argumentTypes(s, $traceurRuntime.type.string, from, RegExp, replace, $traceurRuntime.type.string);
            return assert.returnType((s.replace(from.multiple, replace)), $traceurRuntime.type.string);
          }
        });
      }()));
      Object.defineProperty(StringWrapper.fromCharCode, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(StringWrapper.charCodeAt, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [int]];
        }});
      Object.defineProperty(StringWrapper.split, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [RegExp]];
        }});
      Object.defineProperty(StringWrapper.equals, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(StringWrapper.replaceAll, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [RegExp], [$traceurRuntime.type.string]];
        }});
      StringJoiner = $__export("StringJoiner", (function() {
        var StringJoiner = function StringJoiner() {
          this.parts = [];
        };
        return ($traceurRuntime.createClass)(StringJoiner, {
          add: function(part) {
            assert.argumentTypes(part, $traceurRuntime.type.string);
            this.parts.push(part);
          },
          toString: function() {
            return assert.returnType((this.parts.join("")), $traceurRuntime.type.string);
          }
        }, {});
      }()));
      Object.defineProperty(StringJoiner.prototype.add, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      NumberParseError = $__export("NumberParseError", (function($__super) {
        var NumberParseError = function NumberParseError(message) {
          this.message = message;
        };
        return ($traceurRuntime.createClass)(NumberParseError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(Error)));
      NumberWrapper = $__export("NumberWrapper", (function() {
        var NumberWrapper = function NumberWrapper() {};
        return ($traceurRuntime.createClass)(NumberWrapper, {}, {
          parseIntAutoRadix: function(text) {
            assert.argumentTypes(text, $traceurRuntime.type.string);
            var result = assert.type(parseInt(text), int);
            if (isNaN(result)) {
              throw new NumberParseError("Invalid integer literal when parsing " + text);
            }
            return assert.returnType((result), int);
          },
          parseInt: function(text, radix) {
            assert.argumentTypes(text, $traceurRuntime.type.string, radix, int);
            if (radix == 10) {
              if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return assert.returnType((parseInt(text, radix)), int);
              }
            } else if (radix == 16) {
              if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return assert.returnType((parseInt(text, radix)), int);
              }
            } else {
              var result = assert.type(parseInt(text, radix), int);
              if (!isNaN(result)) {
                return assert.returnType((result), int);
              }
            }
            throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " + radix);
          },
          parseFloat: function(text) {
            assert.argumentTypes(text, $traceurRuntime.type.string);
            return assert.returnType((parseFloat(text)), $traceurRuntime.type.number);
          },
          get NaN() {
            return assert.returnType((NaN), $traceurRuntime.type.number);
          },
          isNaN: function(value) {
            return assert.returnType((isNaN(value)), $traceurRuntime.type.boolean);
          },
          isInteger: function(value) {
            return assert.returnType((Number.isInteger(value)), $traceurRuntime.type.boolean);
          }
        });
      }()));
      Object.defineProperty(NumberWrapper.parseIntAutoRadix, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(NumberWrapper.parseInt, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [int]];
        }});
      Object.defineProperty(NumberWrapper.parseFloat, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      ;
      int.assert = function(value) {
        return value == null || typeof value == 'number' && value === Math.floor(value);
      };
      RegExp = $__export("RegExp", assert.define('RegExp', function(obj) {
        assert(obj).is(assert.structure({
          single: window.RegExp,
          multiple: window.RegExp
        }));
      }));
      RegExpWrapper = $__export("RegExpWrapper", (function() {
        var RegExpWrapper = function RegExpWrapper() {};
        return ($traceurRuntime.createClass)(RegExpWrapper, {}, {
          create: function(regExpStr) {
            return assert.returnType(({
              multiple: new window.RegExp(regExpStr, 'g'),
              single: new window.RegExp(regExpStr)
            }), RegExp);
          },
          firstMatch: function(regExp, input) {
            return input.match(regExp.single);
          },
          matcher: function(regExp, input) {
            return {
              re: regExp.multiple,
              input: input
            };
          }
        });
      }()));
      RegExpMatcherWrapper = $__export("RegExpMatcherWrapper", (function() {
        var RegExpMatcherWrapper = function RegExpMatcherWrapper() {};
        return ($traceurRuntime.createClass)(RegExpMatcherWrapper, {}, {next: function(matcher) {
            return matcher.re.exec(matcher.input);
          }});
      }()));
      FunctionWrapper = $__export("FunctionWrapper", (function() {
        var FunctionWrapper = function FunctionWrapper() {};
        return ($traceurRuntime.createClass)(FunctionWrapper, {}, {apply: function(fn, posArgs) {
            assert.argumentTypes(fn, Function, posArgs, $traceurRuntime.type.any);
            return fn.apply(null, posArgs);
          }});
      }()));
      Object.defineProperty(FunctionWrapper.apply, "parameters", {get: function() {
          return [[Function], []];
        }});
      BaseException = $__export("BaseException", Error);
    }
  };
});




System.register("facade/math", [], function($__export) {
  "use strict";
  var __moduleName = "facade/math";
  var Math;
  return {
    setters: [],
    execute: function() {
      Math = $__export("Math", window.Math);
    }
  };
});




System.register("reflection/reflection", ["facade/lang", "facade/collection", "./reflector", "./reflection_capabilities"], function($__export) {
  "use strict";
  var __moduleName = "reflection/reflection";
  var Type,
      isPresent,
      List,
      ListWrapper,
      Reflector,
      ReflectionCapabilities,
      reflector;
  return {
    setters: [function(m) {
      Type = m.Type;
      isPresent = m.isPresent;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      Reflector = m.Reflector;
      $__export("Reflector", m.Reflector);
    }, function(m) {
      ReflectionCapabilities = m.ReflectionCapabilities;
    }],
    execute: function() {
      reflector = $__export("reflector", new Reflector(new ReflectionCapabilities()));
    }
  };
});




System.register("reflection/reflection_capabilities", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "./types"], function($__export) {
  "use strict";
  var __moduleName = "reflection/reflection_capabilities";
  var assert,
      Type,
      isPresent,
      List,
      ListWrapper,
      GetterFn,
      SetterFn,
      MethodFn,
      ReflectionCapabilities;
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Type = m.Type;
      isPresent = m.isPresent;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
    }, function(m) {
      GetterFn = m.GetterFn;
      SetterFn = m.SetterFn;
      MethodFn = m.MethodFn;
    }],
    execute: function() {
      ReflectionCapabilities = $__export("ReflectionCapabilities", (function() {
        var ReflectionCapabilities = function ReflectionCapabilities() {};
        return ($traceurRuntime.createClass)(ReflectionCapabilities, {
          factory: function(type) {
            assert.argumentTypes(type, Type);
            switch (type.length) {
              case 0:
                return assert.returnType((function() {
                  return new type();
                }), Function);
              case 1:
                return assert.returnType((function(a1) {
                  return new type(a1);
                }), Function);
              case 2:
                return assert.returnType((function(a1, a2) {
                  return new type(a1, a2);
                }), Function);
              case 3:
                return assert.returnType((function(a1, a2, a3) {
                  return new type(a1, a2, a3);
                }), Function);
              case 4:
                return assert.returnType((function(a1, a2, a3, a4) {
                  return new type(a1, a2, a3, a4);
                }), Function);
              case 5:
                return assert.returnType((function(a1, a2, a3, a4, a5) {
                  return new type(a1, a2, a3, a4, a5);
                }), Function);
              case 6:
                return assert.returnType((function(a1, a2, a3, a4, a5, a6) {
                  return new type(a1, a2, a3, a4, a5, a6);
                }), Function);
              case 7:
                return assert.returnType((function(a1, a2, a3, a4, a5, a6, a7) {
                  return new type(a1, a2, a3, a4, a5, a6, a7);
                }), Function);
              case 8:
                return assert.returnType((function(a1, a2, a3, a4, a5, a6, a7, a8) {
                  return new type(a1, a2, a3, a4, a5, a6, a7, a8);
                }), Function);
              case 9:
                return assert.returnType((function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                  return new type(a1, a2, a3, a4, a5, a6, a7, a8, a9);
                }), Function);
              case 10:
                return assert.returnType((function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                  return new type(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
                }), Function);
            }
            ;
            throw new Error("Factory cannot take more than 10 arguments");
          },
          parameters: function(typeOfFunc) {
            return assert.returnType((isPresent(typeOfFunc.parameters) ? typeOfFunc.parameters : ListWrapper.createFixedSize(typeOfFunc.length)), List);
          },
          annotations: function(typeOfFunc) {
            return assert.returnType((isPresent(typeOfFunc.annotations) ? typeOfFunc.annotations : []), List);
          },
          getter: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            return assert.returnType((new Function('o', 'return o.' + name + ';')), GetterFn);
          },
          setter: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            return assert.returnType((new Function('o', 'v', 'return o.' + name + ' = v;')), SetterFn);
          },
          method: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            var method = ("o." + name);
            return assert.returnType((new Function('o', 'args', ("if (!" + method + ") throw new Error('\"" + name + "\" is undefined');") + ("return " + method + ".apply(o, args);"))), MethodFn);
          }
        }, {});
      }()));
      Object.defineProperty(ReflectionCapabilities.prototype.factory, "parameters", {get: function() {
          return [[Type]];
        }});
      Object.defineProperty(ReflectionCapabilities.prototype.getter, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(ReflectionCapabilities.prototype.setter, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(ReflectionCapabilities.prototype.method, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("reflection/reflector", ["rtts_assert/rtts_assert", "facade/lang", "facade/collection", "./types"], function($__export) {
  "use strict";
  var __moduleName = "reflection/reflector";
  var assert,
      Type,
      isPresent,
      stringify,
      BaseException,
      List,
      ListWrapper,
      Map,
      MapWrapper,
      StringMapWrapper,
      SetterFn,
      GetterFn,
      MethodFn,
      Reflector;
  function _mergeMaps(target, config) {
    StringMapWrapper.forEach(config, (function(v, k) {
      return MapWrapper.set(target, k, v);
    }));
  }
  return {
    setters: [function(m) {
      assert = m.assert;
    }, function(m) {
      Type = m.Type;
      isPresent = m.isPresent;
      stringify = m.stringify;
      BaseException = m.BaseException;
    }, function(m) {
      List = m.List;
      ListWrapper = m.ListWrapper;
      Map = m.Map;
      MapWrapper = m.MapWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      SetterFn = m.SetterFn;
      GetterFn = m.GetterFn;
      MethodFn = m.MethodFn;
      $__export("SetterFn", m.SetterFn);
      $__export("GetterFn", m.GetterFn);
      $__export("MethodFn", m.MethodFn);
    }],
    execute: function() {
      Reflector = $__export("Reflector", (function() {
        var Reflector = function Reflector(reflectionCapabilities) {
          this._typeInfo = MapWrapper.create();
          this._getters = MapWrapper.create();
          this._setters = MapWrapper.create();
          this._methods = MapWrapper.create();
          this.reflectionCapabilities = reflectionCapabilities;
        };
        return ($traceurRuntime.createClass)(Reflector, {
          registerType: function(type, typeInfo) {
            MapWrapper.set(this._typeInfo, type, typeInfo);
          },
          registerGetters: function(getters) {
            _mergeMaps(this._getters, getters);
          },
          registerSetters: function(setters) {
            _mergeMaps(this._setters, setters);
          },
          registerMethods: function(methods) {
            _mergeMaps(this._methods, methods);
          },
          factory: function(type) {
            assert.argumentTypes(type, Type);
            if (MapWrapper.contains(this._typeInfo, type)) {
              return assert.returnType((MapWrapper.get(this._typeInfo, type)["factory"]), Function);
            } else {
              return assert.returnType((this.reflectionCapabilities.factory(type)), Function);
            }
          },
          parameters: function(typeOfFunc) {
            if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
              return assert.returnType((MapWrapper.get(this._typeInfo, typeOfFunc)["parameters"]), List);
            } else {
              return assert.returnType((this.reflectionCapabilities.parameters(typeOfFunc)), List);
            }
          },
          annotations: function(typeOfFunc) {
            if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
              return assert.returnType((MapWrapper.get(this._typeInfo, typeOfFunc)["annotations"]), List);
            } else {
              return assert.returnType((this.reflectionCapabilities.annotations(typeOfFunc)), List);
            }
          },
          getter: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            if (MapWrapper.contains(this._getters, name)) {
              return assert.returnType((MapWrapper.get(this._getters, name)), GetterFn);
            } else {
              return assert.returnType((this.reflectionCapabilities.getter(name)), GetterFn);
            }
          },
          setter: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            if (MapWrapper.contains(this._setters, name)) {
              return assert.returnType((MapWrapper.get(this._setters, name)), SetterFn);
            } else {
              return assert.returnType((this.reflectionCapabilities.setter(name)), SetterFn);
            }
          },
          method: function(name) {
            assert.argumentTypes(name, $traceurRuntime.type.string);
            if (MapWrapper.contains(this._methods, name)) {
              return assert.returnType((MapWrapper.get(this._methods, name)), MethodFn);
            } else {
              return assert.returnType((this.reflectionCapabilities.method(name)), MethodFn);
            }
          }
        }, {});
      }()));
      Object.defineProperty(Reflector.prototype.factory, "parameters", {get: function() {
          return [[Type]];
        }});
      Object.defineProperty(Reflector.prototype.getter, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(Reflector.prototype.setter, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(Reflector.prototype.method, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_mergeMaps, "parameters", {get: function() {
          return [[Map], []];
        }});
    }
  };
});




System.register("reflection/types", [], function($__export) {
  "use strict";
  var __moduleName = "reflection/types";
  var SetterFn,
      GetterFn,
      MethodFn;
  return {
    setters: [],
    execute: function() {
      SetterFn = $__export("SetterFn", Function);
      GetterFn = $__export("GetterFn", Function);
      MethodFn = $__export("MethodFn", Function);
    }
  };
});




System.register("rtts_assert/rtts_assert", [], function($__export) {
  "use strict";
  var __moduleName = "rtts_assert/rtts_assert";
  var POSITION_NAME,
      primitives,
      string,
      boolean,
      number,
      currentStack;
  function argPositionName(i) {
    var position = (i / 2) + 1;
    return POSITION_NAME[position] || (position + 'th');
  }
  function proxy() {}
  function assertArgumentTypes() {
    for (var params = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      params[$__2] = arguments[$__2];
    var actual,
        type;
    var currentArgErrors;
    var errors = [];
    var msg;
    for (var i = 0,
        l = params.length; i < l; i = i + 2) {
      actual = params[i];
      type = params[i + 1];
      currentArgErrors = [];
      if (!isType(actual, type, currentArgErrors)) {
        errors.push(argPositionName(i) + ' argument has to be an instance of ' + prettyPrint(type) + ', got ' + prettyPrint(actual));
        if (currentArgErrors.length) {
          errors.push(currentArgErrors);
        }
      }
    }
    if (errors.length) {
      throw new Error('Invalid arguments given!\n' + formatErrors(errors));
    }
  }
  function prettyPrint(value) {
    if (typeof value === 'undefined') {
      return 'undefined';
    }
    if (typeof value === 'string') {
      return '"' + value + '"';
    }
    if (typeof value === 'boolean') {
      return value.toString();
    }
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'object') {
      if (value.__assertName) {
        return value.__assertName;
      }
      if (value.map) {
        return '[' + value.map(prettyPrint).join(', ') + ']';
      }
      var properties = Object.keys(value);
      return '{' + properties.map((function(p) {
        return p + ': ' + prettyPrint(value[p]);
      })).join(', ') + '}';
    }
    return value.__assertName || value.name || value.toString();
  }
  function isType(value, T, errors) {
    if (T === primitives.void) {
      return typeof value === 'undefined';
    }
    if (_isProxy(value)) {
      return true;
    }
    if (T === primitives.any || value === null) {
      return true;
    }
    if (T === primitives.string) {
      return typeof value === 'string';
    }
    if (T === primitives.number) {
      return typeof value === 'number';
    }
    if (T === primitives.boolean) {
      return typeof value === 'boolean';
    }
    if (typeof T.assert === 'function') {
      var parentStack = currentStack;
      var isValid;
      currentStack = errors;
      try {
        isValid = T.assert(value);
      } catch (e) {
        fail(e.message);
        isValid = false;
      }
      currentStack = parentStack;
      if (typeof isValid === 'undefined') {
        isValid = errors.length === 0;
      }
      return isValid;
    }
    return value instanceof T;
  }
  function _isProxy(obj) {
    if (!obj || !obj.constructor || !obj.constructor.annotations)
      return false;
    return obj.constructor.annotations.filter((function(a) {
      return a instanceof proxy;
    })).length > 0;
  }
  function formatErrors(errors) {
    var indent = arguments[1] !== (void 0) ? arguments[1] : '  ';
    return errors.map((function(e) {
      if (typeof e === 'string')
        return indent + '- ' + e;
      return formatErrors(e, indent + '  ');
    })).join('\n');
  }
  function type(actual, T) {
    var errors = [];
    if (!isType(actual, T, errors)) {
      var msg = 'Expected an instance of ' + prettyPrint(T) + ', got ' + prettyPrint(actual) + '!';
      if (errors.length) {
        msg += '\n' + formatErrors(errors);
      }
      throw new Error(msg);
    }
    return actual;
  }
  function returnType(actual, T) {
    var errors = [];
    if (!isType(actual, T, errors)) {
      var msg = 'Expected to return an instance of ' + prettyPrint(T) + ', got ' + prettyPrint(actual) + '!';
      if (errors.length) {
        msg += '\n' + formatErrors(errors);
      }
      throw new Error(msg);
    }
    return actual;
  }
  function arrayOf() {
    for (var types = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      types[$__3] = arguments[$__3];
    return assert.define('array of ' + types.map(prettyPrint).join('/'), function(value) {
      var $__5;
      if (assert(value).is(Array)) {
        for (var $__0 = value[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__1 = void 0; !($__1 = $__0.next()).done; ) {
          var item = $__1.value;
          {
            ($__5 = assert(item)).is.apply($__5, $traceurRuntime.spread(types));
          }
        }
      }
    });
  }
  function structure(definition) {
    var properties = Object.keys(definition);
    return assert.define('object with properties ' + properties.join(', '), function(value) {
      if (assert(value).is(Object)) {
        for (var $__0 = properties[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__1 = void 0; !($__1 = $__0.next()).done; ) {
          var property = $__1.value;
          {
            assert(value[property]).is(definition[property]);
          }
        }
      }
    });
  }
  function fail(message) {
    currentStack.push(message);
  }
  function define(classOrName, check) {
    var cls = classOrName;
    if (typeof classOrName === 'string') {
      cls = function() {};
      cls.__assertName = classOrName;
    }
    cls.assert = function(value) {
      return check(value);
    };
    return cls;
  }
  function assert(value) {
    return {is: function is() {
        var $__5;
        for (var types = [],
            $__4 = 0; $__4 < arguments.length; $__4++)
          types[$__4] = arguments[$__4];
        var allErrors = [];
        var errors;
        for (var $__0 = types[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__1 = void 0; !($__1 = $__0.next()).done; ) {
          var type = $__1.value;
          {
            errors = [];
            if (isType(value, type, errors)) {
              return true;
            }
            allErrors.push(prettyPrint(value) + ' is not instance of ' + prettyPrint(type));
            if (errors.length) {
              allErrors.push(errors);
            }
          }
        }
        ($__5 = currentStack).push.apply($__5, $traceurRuntime.spread(allErrors));
        return false;
      }};
  }
  $__export("proxy", proxy);
  return {
    setters: [],
    execute: function() {
      POSITION_NAME = ['', '1st', '2nd', '3rd'];
      primitives = $traceurRuntime.type;
      string = define('string', function(value) {
        return typeof value === 'string';
      });
      boolean = define('boolean', function(value) {
        return typeof value === 'boolean';
      });
      number = define('number', function(value) {
        return typeof value === 'number';
      });
      currentStack = [];
      assert.type = type;
      assert.argumentTypes = assertArgumentTypes;
      assert.returnType = returnType;
      assert.define = define;
      assert.fail = fail;
      assert.string = string;
      assert.number = number;
      assert.boolean = boolean;
      assert.arrayOf = arrayOf;
      assert.structure = structure;
      $__export("assert", assert);
    }
  };
});





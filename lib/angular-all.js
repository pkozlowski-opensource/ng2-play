System.register("change_detection/array_changes", ["facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/array_changes";
  function require(path) {
    return $traceurRuntime.require("change_detection/array_changes", path);
  }
  var isListLikeIterable,
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
          get _collection() {
            return this.$__0;
          },
          set _collection(value) {
            this.$__0 = value;
          },
          get _length() {
            return this.$__1;
          },
          set _length(value) {
            this.$__1 = value;
          },
          get _linkedRecords() {
            return this.$__2;
          },
          set _linkedRecords(value) {
            this.$__2 = value;
          },
          get _unlinkedRecords() {
            return this.$__3;
          },
          set _unlinkedRecords(value) {
            this.$__3 = value;
          },
          get _previousItHead() {
            return this.$__4;
          },
          set _previousItHead(value) {
            this.$__4 = value;
          },
          get _itHead() {
            return this.$__5;
          },
          set _itHead(value) {
            this.$__5 = value;
          },
          get _itTail() {
            return this.$__6;
          },
          set _itTail(value) {
            this.$__6 = value;
          },
          get _additionsHead() {
            return this.$__7;
          },
          set _additionsHead(value) {
            this.$__7 = value;
          },
          get _additionsTail() {
            return this.$__8;
          },
          set _additionsTail(value) {
            this.$__8 = value;
          },
          get _movesHead() {
            return this.$__9;
          },
          set _movesHead(value) {
            this.$__9 = value;
          },
          get _movesTail() {
            return this.$__10;
          },
          set _movesTail(value) {
            this.$__10 = value;
          },
          get _removalsHead() {
            return this.$__11;
          },
          set _removalsHead(value) {
            this.$__11 = value;
          },
          get _removalsTail() {
            return this.$__12;
          },
          set _removalsTail(value) {
            this.$__12 = value;
          },
          get collection() {
            return this._collection;
          },
          get length() {
            return this._length;
          },
          forEachItem: function(fn) {
            var record;
            for (record = this._itHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            var record;
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachMovedItem: function(fn) {
            var record;
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          check: function(collection) {
            var $__28 = this;
            this._reset();
            var record = this._itHead;
            var mayBeDirty = false;
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
                  record = $__28._mismatch(record, item, index);
                  mayBeDirty = true;
                } else if (mayBeDirty) {
                  record = $__28._verifyReinsertion(record, item, index);
                }
                record = record._next;
                index++;
              }));
              this._length = index;
            }
            this._truncate(record);
            this._collection = collection;
            return this.isDirty;
          },
          get isDirty() {
            return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null;
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
            return record;
          },
          _verifyReinsertion: function(record, item, index) {
            var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
            if (reinsertRecord !== null) {
              record = this._reinsertAfter(reinsertRecord, record._prev, index);
            } else if (record.currentIndex != index) {
              record.currentIndex = index;
              this._addToMoves(record, index);
            }
            return record;
          },
          _truncate: function(record) {
            while (record !== null) {
              var nextRecord = record._next;
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
            return record;
          },
          _moveAfter: function(record, prevRecord, index) {
            this._unlink(record);
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
          },
          _addAfter: function(record, prevRecord, index) {
            this._insertAfter(record, prevRecord, index);
            if (this._additionsTail === null) {
              this._additionsTail = this._additionsHead = record;
            } else {
              this._additionsTail = this._additionsTail._nextAdded = record;
            }
            return record;
          },
          _insertAfter: function(record, prevRecord, index) {
            var next = prevRecord === null ? this._itHead : prevRecord._next;
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
            return record;
          },
          _remove: function(record) {
            return this._addToRemovals(this._unlink(record));
          },
          _unlink: function(record) {
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
            return record;
          },
          _addToMoves: function(record, toIndex) {
            if (record.previousIndex === toIndex) {
              return record;
            }
            if (this._movesTail === null) {
              this._movesTail = this._movesHead = record;
            } else {
              this._movesTail = this._movesTail._nextMoved = record;
            }
            return record;
          },
          _addToRemovals: function(record) {
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
            return record;
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
            return "collection: " + list.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n";
          }
        }, {supports: function(obj) {
            return isListLikeIterable(obj);
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
        return ($traceurRuntime.createClass)(CollectionChangeRecord, {
          get currentIndex() {
            return this.$__13;
          },
          set currentIndex(value) {
            this.$__13 = value;
          },
          get previousIndex() {
            return this.$__14;
          },
          set previousIndex(value) {
            this.$__14 = value;
          },
          get item() {
            return this.$__15;
          },
          set item(value) {
            this.$__15 = value;
          },
          get _nextPrevious() {
            return this.$__16;
          },
          set _nextPrevious(value) {
            this.$__16 = value;
          },
          get _prev() {
            return this.$__17;
          },
          set _prev(value) {
            this.$__17 = value;
          },
          get _next() {
            return this.$__18;
          },
          set _next(value) {
            this.$__18 = value;
          },
          get _prevDup() {
            return this.$__19;
          },
          set _prevDup(value) {
            this.$__19 = value;
          },
          get _nextDup() {
            return this.$__20;
          },
          set _nextDup(value) {
            this.$__20 = value;
          },
          get _prevRemoved() {
            return this.$__21;
          },
          set _prevRemoved(value) {
            this.$__21 = value;
          },
          get _nextRemoved() {
            return this.$__22;
          },
          set _nextRemoved(value) {
            this.$__22 = value;
          },
          get _nextAdded() {
            return this.$__23;
          },
          set _nextAdded(value) {
            this.$__23 = value;
          },
          get _nextMoved() {
            return this.$__24;
          },
          set _nextMoved(value) {
            this.$__24 = value;
          },
          toString: function() {
            return this.previousIndex === this.currentIndex ? stringify(this.item) : stringify(this.item) + '[' + stringify(this.previousIndex) + '->' + stringify(this.currentIndex) + ']';
          }
        }, {});
      }()));
      _DuplicateItemRecordList = (function() {
        var _DuplicateItemRecordList = function _DuplicateItemRecordList() {
          this._head = null;
          this._tail = null;
        };
        return ($traceurRuntime.createClass)(_DuplicateItemRecordList, {
          get _head() {
            return this.$__25;
          },
          set _head(value) {
            this.$__25 = value;
          },
          get _tail() {
            return this.$__26;
          },
          set _tail(value) {
            this.$__26 = value;
          },
          add: function(record) {
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
            var record;
            for (record = this._head; record !== null; record = record._nextDup) {
              if ((afterIndex === null || afterIndex < record.currentIndex) && looseIdentical(record.item, item)) {
                return record;
              }
            }
            return null;
          },
          remove: function(record) {
            var prev = record._prevDup;
            var next = record._nextDup;
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
            return this._head === null;
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
          get map() {
            return this.$__27;
          },
          set map(value) {
            this.$__27 = value;
          },
          put: function(record) {
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
            return isBlank(recordList) ? null : recordList.get(value, afterIndex);
          },
          remove: function(record) {
            var key = getMapKey(record.item);
            var recordList = MapWrapper.get(this.map, key);
            if (recordList.remove(record)) {
              MapWrapper.delete(this.map, key);
            }
            return record;
          },
          get isEmpty() {
            return MapWrapper.size(this.map) === 0;
          },
          clear: function() {
            MapWrapper.clear(this.map);
          },
          toString: function() {
            return '_DuplicateMap(' + stringify(this.map) + ')';
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




System.register("change_detection/change_detection", ["./change_detector", "./parser/ast", "./parser/lexer", "./parser/parser", "./record_range", "./record", "./parser/context_with_variable_bindings"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/change_detection";
  function require(path) {
    return $traceurRuntime.require("change_detection/change_detection", path);
  }
  return {
    setters: [function(m) {
      $__export("ChangeDetectionError", m.ChangeDetectionError);
      $__export("ChangeDetector", m.ChangeDetector);
    }, function(m) {
      $__export("AST", m.AST);
      $__export("ASTWithSource", m.ASTWithSource);
    }, function(m) {
      $__export("Lexer", m.Lexer);
    }, function(m) {
      $__export("Parser", m.Parser);
    }, function(m) {
      $__export("ProtoRecordRange", m.ProtoRecordRange);
      $__export("RecordRange", m.RecordRange);
      $__export("ChangeDispatcher", m.ChangeDispatcher);
    }, function(m) {
      $__export("ProtoRecord", m.ProtoRecord);
      $__export("Record", m.Record);
    }, function(m) {
      $__export("ContextWithVariableBindings", m.ContextWithVariableBindings);
    }],
    execute: function() {}
  };
});




System.register("change_detection/change_detector", ["./record_range", "./record", "facade/lang", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/change_detector";
  function require(path) {
    return $traceurRuntime.require("change_detection/change_detector", path);
  }
  var ProtoRecordRange,
      RecordRange,
      ProtoRecord,
      Record,
      int,
      isPresent,
      isBlank,
      ListWrapper,
      List,
      ExpressionChangedAfterItHasBeenChecked,
      ChangeDetector,
      _singleElementList;
  return {
    setters: [function(m) {
      ProtoRecordRange = m.ProtoRecordRange;
      RecordRange = m.RecordRange;
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      ProtoRecord = m.ProtoRecord;
      Record = m.Record;
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      int = m.int;
      isPresent = m.isPresent;
      isBlank = m.isBlank;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      List = m.List;
    }],
    execute: function() {
      ExpressionChangedAfterItHasBeenChecked = (function($__super) {
        var ExpressionChangedAfterItHasBeenChecked = function ExpressionChangedAfterItHasBeenChecked(record) {
          this.message = ("Expression '" + record.expressionAsString() + "' has changed after it was checked. ") + ("Previous value: '" + record.previousValue + "'. Current value: '" + record.currentValue + "'");
        };
        return ($traceurRuntime.createClass)(ExpressionChangedAfterItHasBeenChecked, {
          get message() {
            return this.$__0;
          },
          set message(value) {
            this.$__0 = value;
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(Error));
      Object.defineProperty(ExpressionChangedAfterItHasBeenChecked, "parameters", {get: function() {
          return [[Record]];
        }});
      ChangeDetector = $__export("ChangeDetector", (function() {
        var ChangeDetector = function ChangeDetector(recordRange) {
          var enforceNoNewChanges = arguments[1] !== (void 0) ? arguments[1] : false;
          this._rootRecordRange = recordRange;
          this._enforceNoNewChanges = enforceNoNewChanges;
        };
        return ($traceurRuntime.createClass)(ChangeDetector, {
          get _rootRecordRange() {
            return this.$__1;
          },
          set _rootRecordRange(value) {
            this.$__1 = value;
          },
          get _enforceNoNewChanges() {
            return this.$__2;
          },
          set _enforceNoNewChanges(value) {
            this.$__2 = value;
          },
          detectChanges: function() {
            var count = this._detectChanges(false);
            if (this._enforceNoNewChanges) {
              this._detectChanges(true);
            }
            return count;
          },
          _detectChanges: function(throwOnChange) {
            var count = 0;
            var updatedRecords = null;
            var record = this._rootRecordRange.findFirstEnabledRecord();
            var currentRange,
                currentGroup;
            while (isPresent(record)) {
              if (record.check()) {
                count++;
                if (record.terminatesExpression()) {
                  if (throwOnChange)
                    throw new ExpressionChangedAfterItHasBeenChecked(record);
                  currentRange = record.recordRange;
                  currentGroup = record.groupMemento();
                  updatedRecords = this._addRecord(updatedRecords, record);
                }
              }
              if (isPresent(updatedRecords)) {
                var nextEnabled = record.nextEnabled;
                if (isBlank(nextEnabled) || currentRange != nextEnabled.recordRange || currentGroup != nextEnabled.groupMemento()) {
                  currentRange.dispatcher.onRecordChange(currentGroup, updatedRecords);
                  updatedRecords = null;
                }
              }
              record = record.findNextEnabled();
            }
            return count;
          },
          _addRecord: function(updatedRecords, record) {
            if (isBlank(updatedRecords)) {
              updatedRecords = _singleElementList;
              updatedRecords[0] = record;
            } else if (updatedRecords === _singleElementList) {
              updatedRecords = [_singleElementList[0], record];
            } else {
              ListWrapper.push(updatedRecords, record);
            }
            return updatedRecords;
          }
        }, {});
      }()));
      Object.defineProperty(ChangeDetector, "parameters", {get: function() {
          return [[RecordRange], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(ChangeDetector.prototype._detectChanges, "parameters", {get: function() {
          return [[$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(ChangeDetector.prototype._addRecord, "parameters", {get: function() {
          return [[List], [Record]];
        }});
      _singleElementList = [null];
    }
  };
});




System.register("change_detection/keyvalue_changes", ["facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/keyvalue_changes";
  function require(path) {
    return $traceurRuntime.require("change_detection/keyvalue_changes", path);
  }
  var ListWrapper,
      MapWrapper,
      StringMapWrapper,
      stringify,
      looseIdentical,
      isJsObject,
      KeyValueChanges,
      KVChangeRecord;
  return {
    setters: [function(m) {
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
          get _records() {
            return this.$__0;
          },
          set _records(value) {
            this.$__0 = value;
          },
          get _map() {
            return this.$__1;
          },
          set _map(value) {
            this.$__1 = value;
          },
          get _mapHead() {
            return this.$__2;
          },
          set _mapHead(value) {
            this.$__2 = value;
          },
          get _previousMapHead() {
            return this.$__3;
          },
          set _previousMapHead(value) {
            this.$__3 = value;
          },
          get _changesHead() {
            return this.$__4;
          },
          set _changesHead(value) {
            this.$__4 = value;
          },
          get _changesTail() {
            return this.$__5;
          },
          set _changesTail(value) {
            this.$__5 = value;
          },
          get _additionsHead() {
            return this.$__6;
          },
          set _additionsHead(value) {
            this.$__6 = value;
          },
          get _additionsTail() {
            return this.$__7;
          },
          set _additionsTail(value) {
            this.$__7 = value;
          },
          get _removalsHead() {
            return this.$__8;
          },
          set _removalsHead(value) {
            this.$__8 = value;
          },
          get _removalsTail() {
            return this.$__9;
          },
          set _removalsTail(value) {
            this.$__9 = value;
          },
          get isDirty() {
            return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null;
          },
          forEachItem: function(fn) {
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            var record;
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachChangedItem: function(fn) {
            var record;
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          check: function(map) {
            var $__19 = this;
            this._reset();
            this._map = map;
            var records = this._records;
            var oldSeqRecord = this._mapHead;
            var lastOldSeqRecord = null;
            var lastNewSeqRecord = null;
            var seqChanged = false;
            this._forEach(map, (function(value, key) {
              var newSeqRecord;
              if (oldSeqRecord !== null && key === oldSeqRecord.key) {
                newSeqRecord = oldSeqRecord;
                if (!looseIdentical(value, oldSeqRecord._currentValue)) {
                  oldSeqRecord._previousValue = oldSeqRecord._currentValue;
                  oldSeqRecord._currentValue = value;
                  $__19._addToChanges(oldSeqRecord);
                }
              } else {
                seqChanged = true;
                if (oldSeqRecord !== null) {
                  oldSeqRecord._next = null;
                  $__19._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                  $__19._addToRemovals(oldSeqRecord);
                }
                if (MapWrapper.contains(records, key)) {
                  newSeqRecord = MapWrapper.get(records, key);
                } else {
                  newSeqRecord = new KVChangeRecord(key);
                  MapWrapper.set(records, key, newSeqRecord);
                  newSeqRecord._currentValue = value;
                  $__19._addToAdditions(newSeqRecord);
                }
              }
              if (seqChanged) {
                if ($__19._isInRemovals(newSeqRecord)) {
                  $__19._removeFromRemovals(newSeqRecord);
                }
                if (lastNewSeqRecord == null) {
                  $__19._mapHead = newSeqRecord;
                } else {
                  lastNewSeqRecord._next = newSeqRecord;
                }
              }
              lastOldSeqRecord = oldSeqRecord;
              lastNewSeqRecord = newSeqRecord;
              oldSeqRecord = oldSeqRecord === null ? null : oldSeqRecord._next;
            }));
            this._truncate(lastOldSeqRecord, oldSeqRecord);
            return this.isDirty;
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
            for (var rec = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
              rec._previousValue = rec._currentValue;
              rec._currentValue = null;
              MapWrapper.delete(this._records, rec.key);
            }
          },
          _isInRemovals: function(record) {
            return record === this._removalsHead || record._nextRemoved !== null || record._prevRemoved !== null;
          },
          _addToRemovals: function(record) {
            if (this._removalsHead === null) {
              this._removalsHead = this._removalsTail = record;
            } else {
              this._removalsTail._nextRemoved = record;
              record._prevRemoved = this._removalsTail;
              this._removalsTail = record;
            }
          },
          _removeFromSeq: function(prev, record) {
            var next = record._next;
            if (prev === null) {
              this._mapHead = next;
            } else {
              prev._next = next;
            }
          },
          _removeFromRemovals: function(record) {
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
            if (this._additionsHead === null) {
              this._additionsHead = this._additionsTail = record;
            } else {
              this._additionsTail._nextAdded = record;
              this._additionsTail = record;
            }
          },
          _addToChanges: function(record) {
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
            return "map: " + items.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n";
          },
          _forEach: function(obj, fn) {
            if (obj instanceof Map) {
              MapWrapper.forEach(obj, fn);
            } else {
              StringMapWrapper.forEach(obj, fn);
            }
          }
        }, {supports: function(obj) {
            return obj instanceof Map || isJsObject(obj);
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
        return ($traceurRuntime.createClass)(KVChangeRecord, {
          get key() {
            return this.$__10;
          },
          set key(value) {
            this.$__10 = value;
          },
          get _previousValue() {
            return this.$__11;
          },
          set _previousValue(value) {
            this.$__11 = value;
          },
          get _currentValue() {
            return this.$__12;
          },
          set _currentValue(value) {
            this.$__12 = value;
          },
          get _nextPrevious() {
            return this.$__13;
          },
          set _nextPrevious(value) {
            this.$__13 = value;
          },
          get _next() {
            return this.$__14;
          },
          set _next(value) {
            this.$__14 = value;
          },
          get _nextAdded() {
            return this.$__15;
          },
          set _nextAdded(value) {
            this.$__15 = value;
          },
          get _nextRemoved() {
            return this.$__16;
          },
          set _nextRemoved(value) {
            this.$__16 = value;
          },
          get _prevRemoved() {
            return this.$__17;
          },
          set _prevRemoved(value) {
            this.$__17 = value;
          },
          get _nextChanged() {
            return this.$__18;
          },
          set _nextChanged(value) {
            this.$__18 = value;
          },
          toString: function() {
            return looseIdentical(this._previousValue, this._currentValue) ? stringify(this.key) : (stringify(this.key) + '[' + stringify(this._previousValue) + '->' + stringify(this._currentValue) + ']');
          }
        }, {});
      }()));
    }
  };
});




System.register("change_detection/record", ["./record_range", "facade/lang", "facade/collection", "./array_changes", "./keyvalue_changes"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/record";
  function require(path) {
    return $traceurRuntime.require("change_detection/record", path);
  }
  var ProtoRecordRange,
      RecordRange,
      FIELD,
      isPresent,
      isBlank,
      int,
      StringWrapper,
      FunctionWrapper,
      BaseException,
      List,
      Map,
      ListWrapper,
      MapWrapper,
      ArrayChanges,
      KeyValueChanges,
      _fresh,
      RECORD_TYPE_MASK,
      RECORD_TYPE_CONST,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_INVOKE_FORMATTER,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_INVOKE_PURE_FUNCTION,
      RECORD_TYPE_ARRAY,
      RECORD_TYPE_KEY_VALUE,
      RECORD_TYPE_MARKER,
      RECORD_TYPE_PROPERTY,
      RECORD_TYPE_NULL,
      RECORD_FLAG_DISABLED,
      RECORD_FLAG_IMPLICIT_RECEIVER,
      RECORD_FLAG_COLLECTION,
      ProtoRecord,
      Record,
      _RecordInspect,
      ChangeDetectionError;
  function _inspect(record) {
    function mode() {
      switch (record.getType()) {
        case RECORD_TYPE_PROPERTY:
          return "property";
        case RECORD_TYPE_INVOKE_METHOD:
          return "invoke_method";
        case RECORD_TYPE_INVOKE_CLOSURE:
          return "invoke_closure";
        case RECORD_TYPE_INVOKE_PURE_FUNCTION:
          return "pure_function";
        case RECORD_TYPE_INVOKE_FORMATTER:
          return "invoke_formatter";
        case RECORD_TYPE_CONST:
          return "const";
        case RECORD_TYPE_KEY_VALUE:
          return "key_value";
        case RECORD_TYPE_ARRAY:
          return "array";
        case RECORD_TYPE_NULL:
          return "null";
        case RECORD_TYPE_MARKER:
          return "marker";
        default:
          return "unexpected type!";
      }
    }
    function disabled() {
      return record.isDisabled() ? "disabled" : "enabled";
    }
    function description() {
      var name = isPresent(record.protoRecord) ? record.protoRecord.name : "";
      var exp = isPresent(record.protoRecord) ? record.protoRecord.expressionAsString : "";
      var currValue = record.currentValue;
      var context = record.context;
      return (mode() + ", " + name + ", " + disabled() + " ") + (" Current: " + currValue + ", Context: " + context + " in [" + exp + "]");
    }
    if (isBlank(record))
      return null;
    if (!(record instanceof Record))
      return record;
    return new _RecordInspect(description(), record);
  }
  function isSame(a, b) {
    if (a === b)
      return true;
    if ((a !== a) && (b !== b))
      return true;
    return false;
  }
  return {
    setters: [function(m) {
      ProtoRecordRange = m.ProtoRecordRange;
      RecordRange = m.RecordRange;
    }, function(m) {
      FIELD = m.FIELD;
      isPresent = m.isPresent;
      isBlank = m.isBlank;
      int = m.int;
      StringWrapper = m.StringWrapper;
      FunctionWrapper = m.FunctionWrapper;
      BaseException = m.BaseException;
    }, function(m) {
      List = m.List;
      Map = m.Map;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      ArrayChanges = m.ArrayChanges;
    }, function(m) {
      KeyValueChanges = m.KeyValueChanges;
    }],
    execute: function() {
      _fresh = new Object();
      RECORD_TYPE_MASK = 0x000f;
      RECORD_TYPE_CONST = $__export("RECORD_TYPE_CONST", 0x0000);
      RECORD_TYPE_INVOKE_CLOSURE = $__export("RECORD_TYPE_INVOKE_CLOSURE", 0x0001);
      RECORD_TYPE_INVOKE_FORMATTER = $__export("RECORD_TYPE_INVOKE_FORMATTER", 0x0002);
      RECORD_TYPE_INVOKE_METHOD = $__export("RECORD_TYPE_INVOKE_METHOD", 0x0003);
      RECORD_TYPE_INVOKE_PURE_FUNCTION = $__export("RECORD_TYPE_INVOKE_PURE_FUNCTION", 0x0004);
      RECORD_TYPE_ARRAY = 0x0005;
      RECORD_TYPE_KEY_VALUE = 0x0006;
      RECORD_TYPE_MARKER = 0x0007;
      RECORD_TYPE_PROPERTY = $__export("RECORD_TYPE_PROPERTY", 0x0008);
      RECORD_TYPE_NULL = 0x0009;
      RECORD_FLAG_DISABLED = 0x0100;
      RECORD_FLAG_IMPLICIT_RECEIVER = $__export("RECORD_FLAG_IMPLICIT_RECEIVER", 0x0200);
      RECORD_FLAG_COLLECTION = $__export("RECORD_FLAG_COLLECTION", 0x0400);
      ProtoRecord = $__export("ProtoRecord", (function() {
        var ProtoRecord = function ProtoRecord(recordRange, mode, funcOrValue, arity, name, dest, groupMemento, expressionAsString) {
          this.recordRange = recordRange;
          this._mode = mode;
          this.funcOrValue = funcOrValue;
          this.arity = arity;
          this.name = name;
          this.dest = dest;
          this.groupMemento = groupMemento;
          this.expressionAsString = expressionAsString;
          this.next = null;
          this.recordInConstruction = null;
        };
        return ($traceurRuntime.createClass)(ProtoRecord, {
          get recordRange() {
            return this.$__0;
          },
          set recordRange(value) {
            this.$__0 = value;
          },
          get _mode() {
            return this.$__1;
          },
          set _mode(value) {
            this.$__1 = value;
          },
          get context() {
            return this.$__2;
          },
          set context(value) {
            this.$__2 = value;
          },
          get funcOrValue() {
            return this.$__3;
          },
          set funcOrValue(value) {
            this.$__3 = value;
          },
          get arity() {
            return this.$__4;
          },
          set arity(value) {
            this.$__4 = value;
          },
          get name() {
            return this.$__5;
          },
          set name(value) {
            this.$__5 = value;
          },
          get dest() {
            return this.$__6;
          },
          set dest(value) {
            this.$__6 = value;
          },
          get groupMemento() {
            return this.$__7;
          },
          set groupMemento(value) {
            this.$__7 = value;
          },
          get expressionAsString() {
            return this.$__8;
          },
          set expressionAsString(value) {
            this.$__8 = value;
          },
          get next() {
            return this.$__9;
          },
          set next(value) {
            this.$__9 = value;
          },
          get recordInConstruction() {
            return this.$__10;
          },
          set recordInConstruction(value) {
            this.$__10 = value;
          },
          setIsImplicitReceiver: function() {
            this._mode |= RECORD_FLAG_IMPLICIT_RECEIVER;
          }
        }, {});
      }()));
      Object.defineProperty(ProtoRecord, "parameters", {get: function() {
          return [[ProtoRecordRange], [int], [], [int], [$traceurRuntime.type.string], [], [], [$traceurRuntime.type.string]];
        }});
      Record = $__export("Record", (function() {
        var Record = function Record(recordRange, protoRecord, formatters) {
          this.recordRange = recordRange;
          this.protoRecord = protoRecord;
          this.next = null;
          this.prev = null;
          this.nextEnabled = null;
          this.prevEnabled = null;
          this.dest = null;
          this.previousValue = null;
          this.context = null;
          this.funcOrValue = null;
          this.args = null;
          if (isBlank(protoRecord)) {
            this._mode = RECORD_TYPE_MARKER | RECORD_FLAG_DISABLED;
            return;
          }
          this._mode = protoRecord._mode;
          if (this.isCollection())
            return;
          this.currentValue = _fresh;
          var type = this.getType();
          if (type === RECORD_TYPE_CONST) {
            this.funcOrValue = protoRecord.funcOrValue;
          } else if (type === RECORD_TYPE_INVOKE_PURE_FUNCTION) {
            this.funcOrValue = protoRecord.funcOrValue;
            this.args = ListWrapper.createFixedSize(protoRecord.arity);
          } else if (type === RECORD_TYPE_INVOKE_FORMATTER) {
            this.funcOrValue = MapWrapper.get(formatters, protoRecord.funcOrValue);
            this.args = ListWrapper.createFixedSize(protoRecord.arity);
          } else if (type === RECORD_TYPE_INVOKE_METHOD) {
            this.funcOrValue = protoRecord.funcOrValue;
            this.args = ListWrapper.createFixedSize(protoRecord.arity);
          } else if (type === RECORD_TYPE_INVOKE_CLOSURE) {
            this.args = ListWrapper.createFixedSize(protoRecord.arity);
          } else if (type === RECORD_TYPE_PROPERTY) {
            this.funcOrValue = protoRecord.funcOrValue;
          }
        };
        return ($traceurRuntime.createClass)(Record, {
          get recordRange() {
            return this.$__11;
          },
          set recordRange(value) {
            this.$__11 = value;
          },
          get protoRecord() {
            return this.$__12;
          },
          set protoRecord(value) {
            this.$__12 = value;
          },
          get next() {
            return this.$__13;
          },
          set next(value) {
            this.$__13 = value;
          },
          get prev() {
            return this.$__14;
          },
          set prev(value) {
            this.$__14 = value;
          },
          get nextEnabled() {
            return this.$__15;
          },
          set nextEnabled(value) {
            this.$__15 = value;
          },
          get prevEnabled() {
            return this.$__16;
          },
          set prevEnabled(value) {
            this.$__16 = value;
          },
          get previousValue() {
            return this.$__17;
          },
          set previousValue(value) {
            this.$__17 = value;
          },
          get currentValue() {
            return this.$__18;
          },
          set currentValue(value) {
            this.$__18 = value;
          },
          get _mode() {
            return this.$__19;
          },
          set _mode(value) {
            this.$__19 = value;
          },
          get context() {
            return this.$__20;
          },
          set context(value) {
            this.$__20 = value;
          },
          get funcOrValue() {
            return this.$__21;
          },
          set funcOrValue(value) {
            this.$__21 = value;
          },
          get args() {
            return this.$__22;
          },
          set args(value) {
            this.$__22 = value;
          },
          get dest() {
            return this.$__23;
          },
          set dest(value) {
            this.$__23 = value;
          },
          getType: function() {
            return this._mode & RECORD_TYPE_MASK;
          },
          setType: function(value) {
            this._mode = (this._mode & ~RECORD_TYPE_MASK) | value;
          },
          isDisabled: function() {
            return (this._mode & RECORD_FLAG_DISABLED) === RECORD_FLAG_DISABLED;
          },
          isEnabled: function() {
            return !this.isDisabled();
          },
          _setDisabled: function(value) {
            if (value) {
              this._mode |= RECORD_FLAG_DISABLED;
            } else {
              this._mode &= ~RECORD_FLAG_DISABLED;
            }
          },
          enable: function() {
            if (this.isEnabled())
              return;
            var prevEnabled = this.findPrevEnabled();
            var nextEnabled = this.findNextEnabled();
            this.prevEnabled = prevEnabled;
            this.nextEnabled = nextEnabled;
            if (isPresent(prevEnabled))
              prevEnabled.nextEnabled = this;
            if (isPresent(nextEnabled))
              nextEnabled.prevEnabled = this;
            this._setDisabled(false);
          },
          disable: function() {
            var prevEnabled = this.prevEnabled;
            var nextEnabled = this.nextEnabled;
            if (isPresent(prevEnabled))
              prevEnabled.nextEnabled = nextEnabled;
            if (isPresent(nextEnabled))
              nextEnabled.prevEnabled = prevEnabled;
            this._setDisabled(true);
          },
          isImplicitReceiver: function() {
            return (this._mode & RECORD_FLAG_IMPLICIT_RECEIVER) === RECORD_FLAG_IMPLICIT_RECEIVER;
          },
          isCollection: function() {
            return (this._mode & RECORD_FLAG_COLLECTION) === RECORD_FLAG_COLLECTION;
          },
          check: function() {
            if (this.isCollection()) {
              return this._checkCollection();
            } else {
              return this._checkSingleRecord();
            }
          },
          _checkSingleRecord: function() {
            this.previousValue = this.currentValue;
            this.currentValue = this._calculateNewValue();
            if (isSame(this.previousValue, this.currentValue))
              return false;
            this._updateDestination();
            return true;
          },
          _updateDestination: function() {
            if (this.dest instanceof Record) {
              if (isPresent(this.protoRecord.dest.position)) {
                this.dest.updateArg(this.currentValue, this.protoRecord.dest.position);
              } else {
                this.dest.updateContext(this.currentValue);
              }
            }
          },
          _checkCollection: function() {
            switch (this.getType()) {
              case RECORD_TYPE_KEY_VALUE:
                var kvChangeDetector = this.currentValue;
                return kvChangeDetector.check(this.context);
              case RECORD_TYPE_ARRAY:
                var arrayChangeDetector = this.currentValue;
                return arrayChangeDetector.check(this.context);
              case RECORD_TYPE_NULL:
                this.disable();
                this.currentValue = null;
                return true;
              default:
                throw new BaseException(("Unsupported record type (" + this.getType() + ")"));
            }
          },
          _calculateNewValue: function() {
            try {
              return this.__calculateNewValue();
            } catch (e) {
              throw new ChangeDetectionError(this, e);
            }
          },
          __calculateNewValue: function() {
            switch (this.getType()) {
              case RECORD_TYPE_PROPERTY:
                var propertyGetter = this.funcOrValue;
                return propertyGetter(this.context);
              case RECORD_TYPE_INVOKE_METHOD:
                var methodInvoker = this.funcOrValue;
                return methodInvoker(this.context, this.args);
              case RECORD_TYPE_INVOKE_CLOSURE:
                return FunctionWrapper.apply(this.context, this.args);
              case RECORD_TYPE_INVOKE_PURE_FUNCTION:
              case RECORD_TYPE_INVOKE_FORMATTER:
                this.disable();
                return FunctionWrapper.apply(this.funcOrValue, this.args);
              case RECORD_TYPE_CONST:
                this.disable();
                return this.funcOrValue;
              default:
                throw new BaseException(("Unsupported record type (" + this.getType() + ")"));
            }
          },
          updateArg: function(value, position) {
            this.args[position] = value;
            this.enable();
          },
          updateContext: function(value) {
            this.context = value;
            this.enable();
            if (this.isCollection()) {
              if (ArrayChanges.supports(value)) {
                if (this.getType() != RECORD_TYPE_ARRAY) {
                  this.setType(RECORD_TYPE_ARRAY);
                  this.currentValue = new ArrayChanges();
                }
                return;
              }
              if (KeyValueChanges.supports(value)) {
                if (this.getType() != RECORD_TYPE_KEY_VALUE) {
                  this.setType(RECORD_TYPE_KEY_VALUE);
                  this.currentValue = new KeyValueChanges();
                }
                return;
              }
              if (isBlank(value)) {
                this.setType(RECORD_TYPE_NULL);
              } else {
                throw new BaseException("Collection records must be array like, map like or null");
              }
            }
          },
          terminatesExpression: function() {
            return !(this.dest instanceof Record);
          },
          isMarkerRecord: function() {
            return this.getType() == RECORD_TYPE_MARKER;
          },
          expressionMemento: function() {
            return this.protoRecord.dest;
          },
          expressionAsString: function() {
            return this.protoRecord.expressionAsString;
          },
          groupMemento: function() {
            return isPresent(this.protoRecord) ? this.protoRecord.groupMemento : null;
          },
          findNextEnabled: function() {
            if (this.isEnabled())
              return this.nextEnabled;
            var record = this.next;
            while (isPresent(record) && record.isDisabled()) {
              if (record.isMarkerRecord() && record.recordRange.disabled) {
                record = record.recordRange.tailRecord.next;
              } else {
                record = record.next;
              }
            }
            return record;
          },
          findPrevEnabled: function() {
            if (this.isEnabled())
              return this.prevEnabled;
            var record = this.prev;
            while (isPresent(record) && record.isDisabled()) {
              if (record.isMarkerRecord() && record.recordRange.disabled) {
                record = record.recordRange.headRecord.prev;
              } else {
                record = record.prev;
              }
            }
            return record;
          },
          inspect: function() {
            return _inspect(this);
          },
          inspectRange: function() {
            return this.recordRange.inspect();
          }
        }, {createMarker: function(rr) {
            return new Record(rr, null, null);
          }});
      }()));
      Object.defineProperty(Record, "parameters", {get: function() {
          return [[RecordRange], [ProtoRecord], [Map]];
        }});
      Object.defineProperty(Record.prototype.setType, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(Record.prototype._setDisabled, "parameters", {get: function() {
          return [[$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(Record.createMarker, "parameters", {get: function() {
          return [[RecordRange]];
        }});
      Object.defineProperty(Record.prototype.updateArg, "parameters", {get: function() {
          return [[], [int]];
        }});
      Object.defineProperty(_inspect, "parameters", {get: function() {
          return [[Record]];
        }});
      _RecordInspect = (function() {
        var _RecordInspect = function _RecordInspect(description, record) {
          this.description = description;
          this.record = record;
        };
        return ($traceurRuntime.createClass)(_RecordInspect, {
          get description() {
            return this.$__24;
          },
          set description(value) {
            this.$__24 = value;
          },
          get record() {
            return this.$__25;
          },
          set record(value) {
            this.$__25 = value;
          },
          get next() {
            return _inspect(this.record.next);
          },
          get nextEnabled() {
            return _inspect(this.record.nextEnabled);
          },
          get dest() {
            return _inspect(this.record.dest);
          }
        }, {});
      }());
      Object.defineProperty(_RecordInspect, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [Record]];
        }});
      ChangeDetectionError = $__export("ChangeDetectionError", (function($__super) {
        var ChangeDetectionError = function ChangeDetectionError(record, originalException) {
          this.originalException = originalException;
          this.location = record.protoRecord.expressionAsString;
          this.message = (this.originalException + " in [" + this.location + "]");
        };
        return ($traceurRuntime.createClass)(ChangeDetectionError, {
          get message() {
            return this.$__26;
          },
          set message(value) {
            this.$__26 = value;
          },
          get originalException() {
            return this.$__27;
          },
          set originalException(value) {
            this.$__27 = value;
          },
          get location() {
            return this.$__28;
          },
          set location(value) {
            this.$__28 = value;
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(Error)));
      Object.defineProperty(ChangeDetectionError, "parameters", {get: function() {
          return [[Record], [$traceurRuntime.type.any]];
        }});
    }
  };
});

System.register("change_detection/record_range", ["./record", "facade/lang", "facade/collection", "./parser/context_with_variable_bindings", "./parser/ast"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/record_range";
  function require(path) {
    return $traceurRuntime.require("change_detection/record_range", path);
  }
  var ProtoRecord,
      Record,
      RECORD_FLAG_COLLECTION,
      RECORD_FLAG_IMPLICIT_RECEIVER,
      RECORD_TYPE_CONST,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_INVOKE_FORMATTER,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_INVOKE_PURE_FUNCTION,
      RECORD_TYPE_PROPERTY,
      FIELD,
      IMPLEMENTS,
      isBlank,
      isPresent,
      int,
      toBool,
      autoConvertAdd,
      BaseException,
      NumberWrapper,
      List,
      Map,
      ListWrapper,
      MapWrapper,
      StringMapWrapper,
      ContextWithVariableBindings,
      AccessMember,
      Assignment,
      AST,
      AstVisitor,
      Binary,
      Chain,
      Collection,
      Conditional,
      Formatter,
      FunctionCall,
      ImplicitReceiver,
      KeyedAccess,
      LiteralArray,
      LiteralMap,
      LiteralPrimitive,
      MethodCall,
      PrefixNot,
      ProtoRecordRange,
      RecordRange,
      ChangeDispatcher,
      Destination,
      ProtoRecordCreator;
  function _inspect(recordRange) {
    var res = [];
    for (var r = recordRange.headRecord.next; r != recordRange.tailRecord; r = r.next) {
      ListWrapper.push(res, r.inspect().description);
    }
    return res;
  }
  function _link(a, b) {
    a.next = b;
    b.prev = a;
  }
  function _linkEnabled(a, b) {
    a.nextEnabled = b;
    b.prevEnabled = a;
  }
  function _operationToFunction(operation) {
    switch (operation) {
      case '+':
        return _operation_add;
      case '-':
        return _operation_subtract;
      case '*':
        return _operation_multiply;
      case '/':
        return _operation_divide;
      case '%':
        return _operation_remainder;
      case '==':
        return _operation_equals;
      case '!=':
        return _operation_not_equals;
      case '<':
        return _operation_less_then;
      case '>':
        return _operation_greater_then;
      case '<=':
        return _operation_less_or_equals_then;
      case '>=':
        return _operation_greater_or_equals_then;
      case '&&':
        return _operation_logical_and;
      case '||':
        return _operation_logical_or;
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
  function _mapGetter(key) {
    return function(map) {
      return MapWrapper.get(map, key);
    };
  }
  function _keyedAccess(obj, args) {
    return obj[args[0]];
  }
  return {
    setters: [function(m) {
      ProtoRecord = m.ProtoRecord;
      Record = m.Record;
      RECORD_FLAG_COLLECTION = m.RECORD_FLAG_COLLECTION;
      RECORD_FLAG_IMPLICIT_RECEIVER = m.RECORD_FLAG_IMPLICIT_RECEIVER;
      RECORD_TYPE_CONST = m.RECORD_TYPE_CONST;
      RECORD_TYPE_INVOKE_CLOSURE = m.RECORD_TYPE_INVOKE_CLOSURE;
      RECORD_TYPE_INVOKE_FORMATTER = m.RECORD_TYPE_INVOKE_FORMATTER;
      RECORD_TYPE_INVOKE_METHOD = m.RECORD_TYPE_INVOKE_METHOD;
      RECORD_TYPE_INVOKE_PURE_FUNCTION = m.RECORD_TYPE_INVOKE_PURE_FUNCTION;
      RECORD_TYPE_PROPERTY = m.RECORD_TYPE_PROPERTY;
    }, function(m) {
      FIELD = m.FIELD;
      IMPLEMENTS = m.IMPLEMENTS;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      int = m.int;
      toBool = m.toBool;
      autoConvertAdd = m.autoConvertAdd;
      BaseException = m.BaseException;
      NumberWrapper = m.NumberWrapper;
    }, function(m) {
      List = m.List;
      Map = m.Map;
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
      StringMapWrapper = m.StringMapWrapper;
    }, function(m) {
      ContextWithVariableBindings = m.ContextWithVariableBindings;
    }, function(m) {
      AccessMember = m.AccessMember;
      Assignment = m.Assignment;
      AST = m.AST;
      AstVisitor = m.AstVisitor;
      Binary = m.Binary;
      Chain = m.Chain;
      Collection = m.Collection;
      Conditional = m.Conditional;
      Formatter = m.Formatter;
      FunctionCall = m.FunctionCall;
      ImplicitReceiver = m.ImplicitReceiver;
      KeyedAccess = m.KeyedAccess;
      LiteralArray = m.LiteralArray;
      LiteralMap = m.LiteralMap;
      LiteralPrimitive = m.LiteralPrimitive;
      MethodCall = m.MethodCall;
      PrefixNot = m.PrefixNot;
    }],
    execute: function() {
      ProtoRecordRange = $__export("ProtoRecordRange", (function() {
        var ProtoRecordRange = function ProtoRecordRange() {
          this.recordCreator = null;
        };
        return ($traceurRuntime.createClass)(ProtoRecordRange, {
          get recordCreator() {
            return this.$__0;
          },
          set recordCreator(value) {
            this.$__0 = value;
          },
          addRecordsFromAST: function(ast, expressionMemento, groupMemento) {
            var content = arguments[3] !== (void 0) ? arguments[3] : false;
            if (this.recordCreator === null) {
              this.recordCreator = new ProtoRecordCreator(this);
            }
            if (content) {
              ast = new Collection(ast);
            }
            this.recordCreator.createRecordsFromAST(ast, expressionMemento, groupMemento);
          },
          instantiate: function(dispatcher, formatters) {
            var recordRange = new RecordRange(this, dispatcher);
            if (this.recordCreator !== null) {
              this._createRecords(recordRange, formatters);
              this._setDestination();
            }
            return recordRange;
          },
          _createRecords: function(recordRange, formatters) {
            for (var proto = this.recordCreator.headRecord; proto != null; proto = proto.next) {
              var record = new Record(recordRange, proto, formatters);
              proto.recordInConstruction = record;
              recordRange.addRecord(record);
            }
          },
          _setDestination: function() {
            for (var proto = this.recordCreator.headRecord; proto != null; proto = proto.next) {
              if (proto.dest instanceof Destination) {
                proto.recordInConstruction.dest = proto.dest.record.recordInConstruction;
              } else {
                proto.recordInConstruction.dest = proto.dest;
              }
              proto.recordInConstruction = null;
            }
          }
        }, {});
      }()));
      Object.defineProperty(ProtoRecordRange.prototype.addRecordsFromAST, "parameters", {get: function() {
          return [[AST], [], [], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(ProtoRecordRange.prototype.instantiate, "parameters", {get: function() {
          return [[], [Map]];
        }});
      Object.defineProperty(ProtoRecordRange.prototype._createRecords, "parameters", {get: function() {
          return [[RecordRange], [Map]];
        }});
      RecordRange = $__export("RecordRange", (function() {
        var RecordRange = function RecordRange(protoRecordRange, dispatcher) {
          this.protoRecordRange = protoRecordRange;
          this.dispatcher = dispatcher;
          this.disabled = false;
          this.headRecord = Record.createMarker(this);
          this.tailRecord = Record.createMarker(this);
          _link(this.headRecord, this.tailRecord);
        };
        return ($traceurRuntime.createClass)(RecordRange, {
          get protoRecordRange() {
            return this.$__1;
          },
          set protoRecordRange(value) {
            this.$__1 = value;
          },
          get dispatcher() {
            return this.$__2;
          },
          set dispatcher(value) {
            this.$__2 = value;
          },
          get headRecord() {
            return this.$__3;
          },
          set headRecord(value) {
            this.$__3 = value;
          },
          get tailRecord() {
            return this.$__4;
          },
          set tailRecord(value) {
            this.$__4 = value;
          },
          get disabled() {
            return this.$__5;
          },
          set disabled(value) {
            this.$__5 = value;
          },
          addRecord: function(record) {
            var lastRecord = this.tailRecord.prev;
            _link(lastRecord, record);
            if (!lastRecord.isDisabled()) {
              _linkEnabled(lastRecord, record);
            }
            _link(record, this.tailRecord);
          },
          addRange: function(child) {
            var lastRecord = this.tailRecord.prev;
            var prevEnabledRecord = this.tailRecord.findPrevEnabled();
            var nextEnabledRerord = this.tailRecord.findNextEnabled();
            var firstEnabledChildRecord = child.findFirstEnabledRecord();
            var lastEnabledChildRecord = child.findLastEnabledRecord();
            _link(lastRecord, child.headRecord);
            _link(child.tailRecord, this.tailRecord);
            if (isPresent(prevEnabledRecord) && isPresent(firstEnabledChildRecord)) {
              _linkEnabled(prevEnabledRecord, firstEnabledChildRecord);
            }
            if (isPresent(nextEnabledRerord) && isPresent(lastEnabledChildRecord)) {
              _linkEnabled(lastEnabledChildRecord, nextEnabledRerord);
            }
          },
          remove: function() {
            var firstEnabledChildRecord = this.findFirstEnabledRecord();
            var next = this.tailRecord.next;
            var prev = this.headRecord.prev;
            _link(prev, next);
            if (isPresent(firstEnabledChildRecord)) {
              var lastEnabledChildRecord = this.findLastEnabledRecord();
              var nextEnabled = lastEnabledChildRecord.nextEnabled;
              var prevEnabled = firstEnabledChildRecord.prevEnabled;
              if (isPresent(nextEnabled))
                nextEnabled.prevEnabled = prevEnabled;
              if (isPresent(prevEnabled))
                prevEnabled.nextEnabled = nextEnabled;
            }
          },
          disable: function() {
            var firstEnabledChildRecord = this.findFirstEnabledRecord();
            if (isPresent(firstEnabledChildRecord)) {
              var lastEnabledChildRecord = this.findLastEnabledRecord();
              var nextEnabled = lastEnabledChildRecord.nextEnabled;
              var prevEnabled = firstEnabledChildRecord.prevEnabled;
              if (isPresent(nextEnabled))
                nextEnabled.prevEnabled = prevEnabled;
              if (isPresent(prevEnabled))
                prevEnabled.nextEnabled = nextEnabled;
            }
            this.disabled = true;
          },
          enable: function() {
            var prevEnabledRecord = this.headRecord.findPrevEnabled();
            var nextEnabledRecord = this.tailRecord.findNextEnabled();
            var firstEnabledthisRecord = this.findFirstEnabledRecord();
            var lastEnabledthisRecord = this.findLastEnabledRecord();
            if (isPresent(firstEnabledthisRecord) && isPresent(prevEnabledRecord)) {
              _linkEnabled(prevEnabledRecord, firstEnabledthisRecord);
            }
            if (isPresent(lastEnabledthisRecord) && isPresent(nextEnabledRecord)) {
              _linkEnabled(lastEnabledthisRecord, nextEnabledRecord);
            }
            this.disabled = false;
          },
          findFirstEnabledRecord: function() {
            var record = this.headRecord.next;
            while (record !== this.tailRecord && record.isDisabled()) {
              if (record.isMarkerRecord() && record.recordRange.disabled) {
                record = record.recordRange.tailRecord.next;
              } else {
                record = record.next;
              }
            }
            return record === this.tailRecord ? null : record;
          },
          findLastEnabledRecord: function() {
            var record = this.tailRecord.prev;
            while (record !== this.headRecord && record.isDisabled()) {
              if (record.isMarkerRecord() && record.recordRange.disabled) {
                record = record.recordRange.headRecord.prev;
              } else {
                record = record.prev;
              }
            }
            return record === this.headRecord ? null : record;
          },
          setContext: function(context) {
            for (var record = this.headRecord; record != null; record = record.next) {
              if (record.isImplicitReceiver()) {
                this._setContextForRecord(context, record);
              }
            }
          },
          _setContextForRecord: function(context, record) {
            var proto = record.protoRecord;
            while (context instanceof ContextWithVariableBindings) {
              if (context.hasBinding(proto.name)) {
                this._setVarBindingGetter(context, record, proto);
                return;
              }
              context = context.parent;
            }
            this._setRegularGetter(context, record, proto);
          },
          _setVarBindingGetter: function(context, record, proto) {
            record.funcOrValue = _mapGetter(proto.name);
            record.updateContext(context.varBindings);
          },
          _setRegularGetter: function(context, record, proto) {
            record.funcOrValue = proto.funcOrValue;
            record.updateContext(context);
          },
          inspect: function() {
            return _inspect(this);
          }
        }, {});
      }()));
      Object.defineProperty(RecordRange, "parameters", {get: function() {
          return [[ProtoRecordRange], []];
        }});
      Object.defineProperty(RecordRange.prototype.addRecord, "parameters", {get: function() {
          return [[Record]];
        }});
      Object.defineProperty(RecordRange.prototype.addRange, "parameters", {get: function() {
          return [[RecordRange]];
        }});
      Object.defineProperty(RecordRange.prototype._setContextForRecord, "parameters", {get: function() {
          return [[], [Record]];
        }});
      Object.defineProperty(RecordRange.prototype._setVarBindingGetter, "parameters", {get: function() {
          return [[], [Record], [ProtoRecord]];
        }});
      Object.defineProperty(RecordRange.prototype._setRegularGetter, "parameters", {get: function() {
          return [[], [Record], [ProtoRecord]];
        }});
      Object.defineProperty(_inspect, "parameters", {get: function() {
          return [[RecordRange]];
        }});
      Object.defineProperty(_link, "parameters", {get: function() {
          return [[Record], [Record]];
        }});
      Object.defineProperty(_linkEnabled, "parameters", {get: function() {
          return [[Record], [Record]];
        }});
      ChangeDispatcher = $__export("ChangeDispatcher", (function() {
        var ChangeDispatcher = function ChangeDispatcher() {};
        return ($traceurRuntime.createClass)(ChangeDispatcher, {onRecordChange: function(groupMemento, records) {}}, {});
      }()));
      Object.defineProperty(ChangeDispatcher.prototype.onRecordChange, "parameters", {get: function() {
          return [[], [List]];
        }});
      Destination = (function() {
        var Destination = function Destination(record, position) {
          this.record = record;
          this.position = position;
        };
        return ($traceurRuntime.createClass)(Destination, {
          get record() {
            return this.$__6;
          },
          set record(value) {
            this.$__6 = value;
          },
          get position() {
            return this.$__7;
          },
          set position(value) {
            this.$__7 = value;
          }
        }, {});
      }());
      Object.defineProperty(Destination, "parameters", {get: function() {
          return [[ProtoRecord], [int]];
        }});
      ProtoRecordCreator = (function() {
        var ProtoRecordCreator = function ProtoRecordCreator(protoRecordRange) {
          this.protoRecordRange = protoRecordRange;
          this.headRecord = null;
          this.tailRecord = null;
          this.expressionAsString = null;
        };
        return ($traceurRuntime.createClass)(ProtoRecordCreator, {
          get protoRecordRange() {
            return this.$__8;
          },
          set protoRecordRange(value) {
            this.$__8 = value;
          },
          get headRecord() {
            return this.$__9;
          },
          set headRecord(value) {
            this.$__9 = value;
          },
          get tailRecord() {
            return this.$__10;
          },
          set tailRecord(value) {
            this.$__10 = value;
          },
          get groupMemento() {
            return this.$__11;
          },
          set groupMemento(value) {
            this.$__11 = value;
          },
          get expressionAsString() {
            return this.$__12;
          },
          set expressionAsString(value) {
            this.$__12 = value;
          },
          visitImplicitReceiver: function(ast, args) {
            throw new BaseException('Should never visit an implicit receiver');
          },
          visitLiteralPrimitive: function(ast, dest) {
            this.add(this.construct(RECORD_TYPE_CONST, ast.value, 0, null, dest));
          },
          visitBinary: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _operationToFunction(ast.operation), 2, ast.operation, dest);
            ast.left.visit(this, new Destination(record, 0));
            ast.right.visit(this, new Destination(record, 1));
            this.add(record);
          },
          visitPrefixNot: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _operation_negate, 1, "-", dest);
            ast.expression.visit(this, new Destination(record, 0));
            this.add(record);
          },
          visitAccessMember: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_PROPERTY, ast.getter, 0, ast.name, dest);
            if (ast.receiver instanceof ImplicitReceiver) {
              record.setIsImplicitReceiver();
            } else {
              ast.receiver.visit(this, new Destination(record, null));
            }
            this.add(record);
          },
          visitFormatter: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_INVOKE_FORMATTER, ast.name, ast.allArgs.length, ast.name, dest);
            for (var i = 0; i < ast.allArgs.length; ++i) {
              ast.allArgs[i].visit(this, new Destination(record, i));
            }
            this.add(record);
          },
          visitMethodCall: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_INVOKE_METHOD, ast.fn, ast.args.length, ast.name, dest);
            for (var i = 0; i < ast.args.length; ++i) {
              ast.args[i].visit(this, new Destination(record, i));
            }
            if (ast.receiver instanceof ImplicitReceiver) {
              record.setIsImplicitReceiver();
            } else {
              ast.receiver.visit(this, new Destination(record, null));
            }
            this.add(record);
          },
          visitFunctionCall: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_INVOKE_CLOSURE, null, ast.args.length, null, dest);
            ast.target.visit(this, new Destination(record, null));
            for (var i = 0; i < ast.args.length; ++i) {
              ast.args[i].visit(this, new Destination(record, i));
            }
            this.add(record);
          },
          visitCollection: function(ast, dest) {
            var record = this.construct(RECORD_FLAG_COLLECTION, null, null, null, dest);
            ast.value.visit(this, new Destination(record, null));
            this.add(record);
          },
          visitConditional: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _cond, 3, "?:", dest);
            ast.condition.visit(this, new Destination(record, 0));
            ast.trueExp.visit(this, new Destination(record, 1));
            ast.falseExp.visit(this, new Destination(record, 2));
            this.add(record);
          },
          visitKeyedAccess: function(ast, dest) {
            var record = this.construct(RECORD_TYPE_INVOKE_METHOD, _keyedAccess, 1, "[]", dest);
            ast.obj.visit(this, new Destination(record, null));
            ast.key.visit(this, new Destination(record, 0));
            this.add(record);
          },
          visitLiteralArray: function(ast, dest) {
            var length = ast.expressions.length;
            var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _arrayFn(length), length, "Array()", dest);
            for (var i = 0; i < length; ++i) {
              ast.expressions[i].visit(this, new Destination(record, i));
            }
            this.add(record);
          },
          visitLiteralMap: function(ast, dest) {
            var length = ast.values.length;
            var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _mapFn(ast.keys, length), length, "Map()", dest);
            for (var i = 0; i < length; ++i) {
              ast.values[i].visit(this, new Destination(record, i));
            }
            this.add(record);
          },
          visitChain: function(ast, dest) {
            this._unsupported();
          },
          visitAssignment: function(ast, dest) {
            this._unsupported();
          },
          visitTemplateBindings: function(ast, dest) {
            this._unsupported();
          },
          createRecordsFromAST: function(ast, expressionMemento, groupMemento) {
            this.groupMemento = groupMemento;
            this.expressionAsString = ast.toString();
            ast.visit(this, expressionMemento);
          },
          construct: function(recordType, funcOrValue, arity, name, dest) {
            return new ProtoRecord(this.protoRecordRange, recordType, funcOrValue, arity, name, dest, this.groupMemento, this.expressionAsString);
          },
          add: function(protoRecord) {
            if (this.headRecord === null) {
              this.headRecord = this.tailRecord = protoRecord;
            } else {
              this.tailRecord.next = protoRecord;
              this.tailRecord = protoRecord;
            }
          },
          _unsupported: function() {
            throw new BaseException("Unsupported");
          }
        }, {});
      }());
      Object.defineProperty(ProtoRecordCreator, "annotations", {get: function() {
          return [new IMPLEMENTS(AstVisitor)];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitImplicitReceiver, "parameters", {get: function() {
          return [[ImplicitReceiver], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitLiteralPrimitive, "parameters", {get: function() {
          return [[LiteralPrimitive], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitBinary, "parameters", {get: function() {
          return [[Binary], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitPrefixNot, "parameters", {get: function() {
          return [[PrefixNot], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitAccessMember, "parameters", {get: function() {
          return [[AccessMember], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitFormatter, "parameters", {get: function() {
          return [[Formatter], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitMethodCall, "parameters", {get: function() {
          return [[MethodCall], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitFunctionCall, "parameters", {get: function() {
          return [[FunctionCall], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitCollection, "parameters", {get: function() {
          return [[Collection], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitConditional, "parameters", {get: function() {
          return [[Conditional], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitKeyedAccess, "parameters", {get: function() {
          return [[KeyedAccess], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitLiteralArray, "parameters", {get: function() {
          return [[LiteralArray], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitLiteralMap, "parameters", {get: function() {
          return [[LiteralMap], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitChain, "parameters", {get: function() {
          return [[Chain], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.visitAssignment, "parameters", {get: function() {
          return [[Assignment], []];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.createRecordsFromAST, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.any], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(ProtoRecordCreator.prototype.add, "parameters", {get: function() {
          return [[ProtoRecord]];
        }});
      Object.defineProperty(_operationToFunction, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Object.defineProperty(_arrayFn, "parameters", {get: function() {
          return [[int]];
        }});
      Object.defineProperty(_mapFn, "parameters", {get: function() {
          return [[List], [int]];
        }});
    }
  };
});

System.register("change_detection/parser/ast", ["facade/lang", "facade/collection", "./context_with_variable_bindings"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/ast";
  function require(path) {
    return $traceurRuntime.require("change_detection/parser/ast", path);
  }
  var FIELD,
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
      Collection,
      ImplicitReceiver,
      Chain,
      Conditional,
      AccessMember,
      KeyedAccess,
      Formatter,
      LiteralPrimitive,
      LiteralArray,
      LiteralMap,
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
    var length = exps.length;
    var result = _evalListCache[length];
    for (var i = 0; i < length; i++) {
      result[i] = exps[i].eval(context);
    }
    return result;
  }
  return {
    setters: [function(m) {
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
          visit: function(visitor, args) {},
          toString: function() {
            return "AST";
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
          visit: function(visitor, args) {}
        }, {}, $__super);
      }(AST)));
      Collection = $__export("Collection", (function($__super) {
        var Collection = function Collection(value) {
          this.value = value;
        };
        return ($traceurRuntime.createClass)(Collection, {
          get value() {
            return this.$__0;
          },
          set value(value) {
            this.$__0 = value;
          },
          eval: function(context) {
            return value.eval(context);
          },
          visit: function(visitor, args) {
            visitor.visitCollection(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Collection, "parameters", {get: function() {
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
          visit: function(visitor, args) {
            visitor.visitImplicitReceiver(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Chain = $__export("Chain", (function($__super) {
        var Chain = function Chain(expressions) {
          this.expressions = expressions;
        };
        return ($traceurRuntime.createClass)(Chain, {
          get expressions() {
            return this.$__1;
          },
          set expressions(value) {
            this.$__1 = value;
          },
          eval: function(context) {
            var result;
            for (var i = 0; i < this.expressions.length; i++) {
              var last = this.expressions[i].eval(context);
              if (isPresent(last))
                result = last;
            }
            return result;
          },
          visit: function(visitor, args) {
            visitor.visitChain(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Chain, "parameters", {get: function() {
          return [[List]];
        }});
      Conditional = $__export("Conditional", (function($__super) {
        var Conditional = function Conditional(condition, trueExp, falseExp) {
          this.condition = condition;
          this.trueExp = trueExp;
          this.falseExp = falseExp;
        };
        return ($traceurRuntime.createClass)(Conditional, {
          get condition() {
            return this.$__2;
          },
          set condition(value) {
            this.$__2 = value;
          },
          get trueExp() {
            return this.$__3;
          },
          set trueExp(value) {
            this.$__3 = value;
          },
          get falseExp() {
            return this.$__4;
          },
          set falseExp(value) {
            this.$__4 = value;
          },
          eval: function(context) {
            if (this.condition.eval(context)) {
              return this.trueExp.eval(context);
            } else {
              return this.falseExp.eval(context);
            }
          },
          visit: function(visitor, args) {
            visitor.visitConditional(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Conditional, "parameters", {get: function() {
          return [[AST], [AST], [AST]];
        }});
      AccessMember = $__export("AccessMember", (function($__super) {
        var AccessMember = function AccessMember(receiver, name, getter, setter) {
          this.receiver = receiver;
          this.name = name;
          this.getter = getter;
          this.setter = setter;
        };
        return ($traceurRuntime.createClass)(AccessMember, {
          get receiver() {
            return this.$__5;
          },
          set receiver(value) {
            this.$__5 = value;
          },
          get name() {
            return this.$__6;
          },
          set name(value) {
            this.$__6 = value;
          },
          get getter() {
            return this.$__7;
          },
          set getter(value) {
            this.$__7 = value;
          },
          get setter() {
            return this.$__8;
          },
          set setter(value) {
            this.$__8 = value;
          },
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
          visit: function(visitor, args) {
            visitor.visitAccessMember(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(AccessMember, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [Function], [Function]];
        }});
      KeyedAccess = $__export("KeyedAccess", (function($__super) {
        var KeyedAccess = function KeyedAccess(obj, key) {
          this.obj = obj;
          this.key = key;
        };
        return ($traceurRuntime.createClass)(KeyedAccess, {
          get obj() {
            return this.$__9;
          },
          set obj(value) {
            this.$__9 = value;
          },
          get key() {
            return this.$__10;
          },
          set key(value) {
            this.$__10 = value;
          },
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
          visit: function(visitor, args) {
            visitor.visitKeyedAccess(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(KeyedAccess, "parameters", {get: function() {
          return [[AST], [AST]];
        }});
      Formatter = $__export("Formatter", (function($__super) {
        var Formatter = function Formatter(exp, name, args) {
          this.exp = exp;
          this.name = name;
          this.args = args;
          this.allArgs = ListWrapper.concat([exp], args);
        };
        return ($traceurRuntime.createClass)(Formatter, {
          get exp() {
            return this.$__11;
          },
          set exp(value) {
            this.$__11 = value;
          },
          get name() {
            return this.$__12;
          },
          set name(value) {
            this.$__12 = value;
          },
          get args() {
            return this.$__13;
          },
          set args(value) {
            this.$__13 = value;
          },
          get allArgs() {
            return this.$__14;
          },
          set allArgs(value) {
            this.$__14 = value;
          },
          visit: function(visitor, args) {
            visitor.visitFormatter(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Formatter, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [List]];
        }});
      LiteralPrimitive = $__export("LiteralPrimitive", (function($__super) {
        var LiteralPrimitive = function LiteralPrimitive(value) {
          this.value = value;
        };
        return ($traceurRuntime.createClass)(LiteralPrimitive, {
          get value() {
            return this.$__15;
          },
          set value(value) {
            this.$__15 = value;
          },
          eval: function(context) {
            return this.value;
          },
          visit: function(visitor, args) {
            visitor.visitLiteralPrimitive(this, args);
          }
        }, {}, $__super);
      }(AST)));
      LiteralArray = $__export("LiteralArray", (function($__super) {
        var LiteralArray = function LiteralArray(expressions) {
          this.expressions = expressions;
        };
        return ($traceurRuntime.createClass)(LiteralArray, {
          get expressions() {
            return this.$__16;
          },
          set expressions(value) {
            this.$__16 = value;
          },
          eval: function(context) {
            return ListWrapper.map(this.expressions, (function(e) {
              return e.eval(context);
            }));
          },
          visit: function(visitor, args) {
            visitor.visitLiteralArray(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(LiteralArray, "parameters", {get: function() {
          return [[List]];
        }});
      LiteralMap = $__export("LiteralMap", (function($__super) {
        var LiteralMap = function LiteralMap(keys, values) {
          this.keys = keys;
          this.values = values;
        };
        return ($traceurRuntime.createClass)(LiteralMap, {
          get keys() {
            return this.$__17;
          },
          set keys(value) {
            this.$__17 = value;
          },
          get values() {
            return this.$__18;
          },
          set values(value) {
            this.$__18 = value;
          },
          eval: function(context) {
            var res = StringMapWrapper.create();
            for (var i = 0; i < this.keys.length; ++i) {
              StringMapWrapper.set(res, this.keys[i], this.values[i].eval(context));
            }
            return res;
          },
          visit: function(visitor, args) {
            visitor.visitLiteralMap(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(LiteralMap, "parameters", {get: function() {
          return [[List], [List]];
        }});
      Binary = $__export("Binary", (function($__super) {
        var Binary = function Binary(operation, left, right) {
          this.operation = operation;
          this.left = left;
          this.right = right;
        };
        return ($traceurRuntime.createClass)(Binary, {
          get operation() {
            return this.$__19;
          },
          set operation(value) {
            this.$__19 = value;
          },
          get left() {
            return this.$__20;
          },
          set left(value) {
            this.$__20 = value;
          },
          get right() {
            return this.$__21;
          },
          set right(value) {
            this.$__21 = value;
          },
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
          visit: function(visitor, args) {
            visitor.visitBinary(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Binary, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [AST], [AST]];
        }});
      PrefixNot = $__export("PrefixNot", (function($__super) {
        var PrefixNot = function PrefixNot(expression) {
          this.expression = expression;
        };
        return ($traceurRuntime.createClass)(PrefixNot, {
          get expression() {
            return this.$__22;
          },
          set expression(value) {
            this.$__22 = value;
          },
          eval: function(context) {
            return !this.expression.eval(context);
          },
          visit: function(visitor, args) {
            visitor.visitPrefixNot(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(PrefixNot, "parameters", {get: function() {
          return [[AST]];
        }});
      Assignment = $__export("Assignment", (function($__super) {
        var Assignment = function Assignment(target, value) {
          this.target = target;
          this.value = value;
        };
        return ($traceurRuntime.createClass)(Assignment, {
          get target() {
            return this.$__23;
          },
          set target(value) {
            this.$__23 = value;
          },
          get value() {
            return this.$__24;
          },
          set value(value) {
            this.$__24 = value;
          },
          eval: function(context) {
            return this.target.assign(context, this.value.eval(context));
          },
          visit: function(visitor, args) {
            visitor.visitAssignment(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(Assignment, "parameters", {get: function() {
          return [[AST], [AST]];
        }});
      MethodCall = $__export("MethodCall", (function($__super) {
        var MethodCall = function MethodCall(receiver, name, fn, args) {
          this.receiver = receiver;
          this.fn = fn;
          this.args = args;
          this.name = name;
        };
        return ($traceurRuntime.createClass)(MethodCall, {
          get receiver() {
            return this.$__25;
          },
          set receiver(value) {
            this.$__25 = value;
          },
          get fn() {
            return this.$__26;
          },
          set fn(value) {
            this.$__26 = value;
          },
          get args() {
            return this.$__27;
          },
          set args(value) {
            this.$__27 = value;
          },
          get name() {
            return this.$__28;
          },
          set name(value) {
            this.$__28 = value;
          },
          eval: function(context) {
            var obj = this.receiver.eval(context);
            return this.fn(obj, evalList(context, this.args));
          },
          visit: function(visitor, args) {
            visitor.visitMethodCall(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(MethodCall, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [Function], [List]];
        }});
      FunctionCall = $__export("FunctionCall", (function($__super) {
        var FunctionCall = function FunctionCall(target, args) {
          this.target = target;
          this.args = args;
        };
        return ($traceurRuntime.createClass)(FunctionCall, {
          get target() {
            return this.$__29;
          },
          set target(value) {
            this.$__29 = value;
          },
          get args() {
            return this.$__30;
          },
          set args(value) {
            this.$__30 = value;
          },
          eval: function(context) {
            var obj = this.target.eval(context);
            if (!(obj instanceof Function)) {
              throw new BaseException((obj + " is not a function"));
            }
            return FunctionWrapper.apply(obj, evalList(context, this.args));
          },
          visit: function(visitor, args) {
            visitor.visitFunctionCall(this, args);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(FunctionCall, "parameters", {get: function() {
          return [[AST], [List]];
        }});
      ASTWithSource = $__export("ASTWithSource", (function($__super) {
        var ASTWithSource = function ASTWithSource(ast, source, location) {
          this.source = source;
          this.location = location;
          this.ast = ast;
        };
        return ($traceurRuntime.createClass)(ASTWithSource, {
          get ast() {
            return this.$__31;
          },
          set ast(value) {
            this.$__31 = value;
          },
          get source() {
            return this.$__32;
          },
          set source(value) {
            this.$__32 = value;
          },
          get location() {
            return this.$__33;
          },
          set location(value) {
            this.$__33 = value;
          },
          eval: function(context) {
            return this.ast.eval(context);
          },
          get isAssignable() {
            return this.ast.isAssignable;
          },
          assign: function(context, value) {
            return this.ast.assign(context, value);
          },
          visit: function(visitor, args) {
            return this.ast.visit(visitor, args);
          },
          toString: function() {
            return (this.source + " in " + this.location);
          }
        }, {}, $__super);
      }(AST)));
      Object.defineProperty(ASTWithSource, "parameters", {get: function() {
          return [[AST], [$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      TemplateBinding = $__export("TemplateBinding", (function() {
        var TemplateBinding = function TemplateBinding(key, name, expression) {
          this.key = key;
          this.name = name;
          this.expression = expression;
        };
        return ($traceurRuntime.createClass)(TemplateBinding, {
          get key() {
            return this.$__34;
          },
          set key(value) {
            this.$__34 = value;
          },
          get name() {
            return this.$__35;
          },
          set name(value) {
            this.$__35 = value;
          },
          get expression() {
            return this.$__36;
          },
          set expression(value) {
            this.$__36 = value;
          }
        }, {});
      }()));
      Object.defineProperty(TemplateBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string], [ASTWithSource]];
        }});
      AstVisitor = $__export("AstVisitor", (function() {
        var AstVisitor = function AstVisitor() {};
        return ($traceurRuntime.createClass)(AstVisitor, {
          visitAccessMember: function(ast, args) {},
          visitAssignment: function(ast, args) {},
          visitBinary: function(ast, args) {},
          visitChain: function(ast, args) {},
          visitCollection: function(ast, args) {},
          visitConditional: function(ast, args) {},
          visitFormatter: function(ast, args) {},
          visitFunctionCall: function(ast, args) {},
          visitImplicitReceiver: function(ast, args) {},
          visitKeyedAccess: function(ast, args) {},
          visitLiteralArray: function(ast, args) {},
          visitLiteralMap: function(ast, args) {},
          visitLiteralPrimitive: function(ast, args) {},
          visitMethodCall: function(ast, args) {},
          visitPrefixNot: function(ast, args) {}
        }, {});
      }()));
      Object.defineProperty(AstVisitor.prototype.visitAccessMember, "parameters", {get: function() {
          return [[AccessMember], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitAssignment, "parameters", {get: function() {
          return [[Assignment], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitBinary, "parameters", {get: function() {
          return [[Binary], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitChain, "parameters", {get: function() {
          return [[Chain], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitCollection, "parameters", {get: function() {
          return [[Collection], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitConditional, "parameters", {get: function() {
          return [[Conditional], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitFormatter, "parameters", {get: function() {
          return [[Formatter], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitFunctionCall, "parameters", {get: function() {
          return [[FunctionCall], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitImplicitReceiver, "parameters", {get: function() {
          return [[ImplicitReceiver], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitKeyedAccess, "parameters", {get: function() {
          return [[KeyedAccess], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitLiteralArray, "parameters", {get: function() {
          return [[LiteralArray], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitLiteralMap, "parameters", {get: function() {
          return [[LiteralMap], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitLiteralPrimitive, "parameters", {get: function() {
          return [[LiteralPrimitive], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitMethodCall, "parameters", {get: function() {
          return [[MethodCall], []];
        }});
      Object.defineProperty(AstVisitor.prototype.visitPrefixNot, "parameters", {get: function() {
          return [[PrefixNot], []];
        }});
      _evalListCache = [[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0]];
      Object.defineProperty(evalList, "parameters", {get: function() {
          return [[], [List]];
        }});
    }
  };
});

System.register("change_detection/parser/context_with_variable_bindings", ["facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/context_with_variable_bindings";
  function require(path) {
    return $traceurRuntime.require("change_detection/parser/context_with_variable_bindings", path);
  }
  var MapWrapper,
      BaseException,
      ContextWithVariableBindings;
  return {
    setters: [function(m) {
      MapWrapper = m.MapWrapper;
    }, function(m) {
      BaseException = m.BaseException;
    }],
    execute: function() {
      ContextWithVariableBindings = $__export("ContextWithVariableBindings", (function() {
        var ContextWithVariableBindings = function ContextWithVariableBindings(parent, varBindings) {
          this.parent = parent;
          this.varBindings = varBindings;
        };
        return ($traceurRuntime.createClass)(ContextWithVariableBindings, {
          get parent() {
            return this.$__0;
          },
          set parent(value) {
            this.$__0 = value;
          },
          get varBindings() {
            return this.$__1;
          },
          set varBindings(value) {
            this.$__1 = value;
          },
          hasBinding: function(name) {
            return MapWrapper.contains(this.varBindings, name);
          },
          get: function(name) {
            return MapWrapper.get(this.varBindings, name);
          },
          set: function(name, value) {
            if (this.hasBinding(name)) {
              MapWrapper.set(this.varBindings, name, value);
            } else {
              throw new BaseException('VariableBindings do not support setting of new keys post-construction.');
            }
          },
          clearValues: function() {
            for (var $__3 = MapWrapper.keys(this.varBindings)[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__4; !($__4 = $__3.next()).done; ) {
              var k = $__4.value;
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

System.register("change_detection/parser/lexer", ["facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/lexer";
  function require(path) {
    return $traceurRuntime.require("change_detection/parser/lexer", path);
  }
  var List,
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
    return new Token(index, TOKEN_TYPE_CHARACTER, code, StringWrapper.fromCharCode(code));
  }
  function newIdentifierToken(index, text) {
    return new Token(index, TOKEN_TYPE_IDENTIFIER, 0, text);
  }
  function newKeywordToken(index, text) {
    return new Token(index, TOKEN_TYPE_KEYWORD, 0, text);
  }
  function newOperatorToken(index, text) {
    return new Token(index, TOKEN_TYPE_OPERATOR, 0, text);
  }
  function newStringToken(index, text) {
    return new Token(index, TOKEN_TYPE_STRING, 0, text);
  }
  function newNumberToken(index, n) {
    return new Token(index, TOKEN_TYPE_NUMBER, n, "");
  }
  function isWhitespace(code) {
    return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
  }
  function isIdentifierStart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || (code == $_) || (code == $$);
  }
  function isIdentifierPart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || ($0 <= code && code <= $9) || (code == $_) || (code == $$);
  }
  function isDigit(code) {
    return $0 <= code && code <= $9;
  }
  function isExponentStart(code) {
    return code == $e || code == $E;
  }
  function isExponentSign(code) {
    return code == $MINUS || code == $PLUS;
  }
  function unescape(code) {
    switch (code) {
      case $n:
        return $LF;
      case $f:
        return $FF;
      case $r:
        return $CR;
      case $t:
        return $TAB;
      case $v:
        return $VTAB;
      default:
        return code;
    }
  }
  return {
    setters: [function(m) {
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
        return ($traceurRuntime.createClass)(Lexer, {
          get text() {
            return this.$__0;
          },
          set text(value) {
            this.$__0 = value;
          },
          tokenize: function(text) {
            var scanner = new _Scanner(text);
            var tokens = [];
            var token = scanner.scanToken();
            while (token != null) {
              ListWrapper.push(tokens, token);
              token = scanner.scanToken();
            }
            return tokens;
          }
        }, {});
      }()));
      Object.defineProperty(Lexer.prototype.tokenize, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      Token = $__export("Token", (function() {
        var Token = function Token(index, type, numValue, strValue) {
          this.index = index;
          this.type = type;
          this._numValue = numValue;
          this._strValue = strValue;
        };
        return ($traceurRuntime.createClass)(Token, {
          get index() {
            return this.$__1;
          },
          set index(value) {
            this.$__1 = value;
          },
          get type() {
            return this.$__2;
          },
          set type(value) {
            this.$__2 = value;
          },
          get _numValue() {
            return this.$__3;
          },
          set _numValue(value) {
            this.$__3 = value;
          },
          get _strValue() {
            return this.$__4;
          },
          set _strValue(value) {
            this.$__4 = value;
          },
          isCharacter: function(code) {
            return (this.type == TOKEN_TYPE_CHARACTER && this._numValue == code);
          },
          isNumber: function() {
            return (this.type == TOKEN_TYPE_NUMBER);
          },
          isString: function() {
            return (this.type == TOKEN_TYPE_STRING);
          },
          isOperator: function(operater) {
            return (this.type == TOKEN_TYPE_OPERATOR && this._strValue == operater);
          },
          isIdentifier: function() {
            return (this.type == TOKEN_TYPE_IDENTIFIER);
          },
          isKeyword: function() {
            return (this.type == TOKEN_TYPE_KEYWORD);
          },
          isKeywordNull: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "null");
          },
          isKeywordUndefined: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "undefined");
          },
          isKeywordTrue: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "true");
          },
          isKeywordFalse: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "false");
          },
          toNumber: function() {
            return (this.type == TOKEN_TYPE_NUMBER) ? this._numValue : -1;
          },
          toString: function() {
            var type = this.type;
            if (type >= TOKEN_TYPE_CHARACTER && type <= TOKEN_TYPE_STRING) {
              return this._strValue;
            } else if (type == TOKEN_TYPE_NUMBER) {
              return this._numValue.toString();
            } else {
              return null;
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
      EOF = $__export("EOF", new Token(-1, 0, 0, ""));
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
        return ($traceurRuntime.createClass)(ScannerError, {
          get message() {
            return this.$__5;
          },
          set message(value) {
            this.$__5 = value;
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(Error)));
      _Scanner = (function() {
        var _Scanner = function _Scanner(input) {
          this.input = input;
          this.length = input.length;
          this.peek = 0;
          this.index = -1;
          this.advance();
        };
        return ($traceurRuntime.createClass)(_Scanner, {
          get input() {
            return this.$__6;
          },
          set input(value) {
            this.$__6 = value;
          },
          get length() {
            return this.$__7;
          },
          set length(value) {
            this.$__7 = value;
          },
          get peek() {
            return this.$__8;
          },
          set peek(value) {
            this.$__8 = value;
          },
          get index() {
            return this.$__9;
          },
          set index(value) {
            this.$__9 = value;
          },
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
              return null;
            }
            if (isIdentifierStart(peek))
              return this.scanIdentifier();
            if (isDigit(peek))
              return this.scanNumber(index);
            var start = index;
            switch (peek) {
              case $PERIOD:
                this.advance();
                return isDigit(this.peek) ? this.scanNumber(start) : newCharacterToken(start, $PERIOD);
              case $LPAREN:
              case $RPAREN:
              case $LBRACE:
              case $RBRACE:
              case $LBRACKET:
              case $RBRACKET:
              case $COMMA:
              case $COLON:
              case $SEMICOLON:
                return this.scanCharacter(start, peek);
              case $SQ:
              case $DQ:
                return this.scanString();
              case $HASH:
                return this.scanOperator(start, StringWrapper.fromCharCode(peek));
              case $PLUS:
              case $MINUS:
              case $STAR:
              case $SLASH:
              case $PERCENT:
              case $CARET:
              case $QUESTION:
                return this.scanOperator(start, StringWrapper.fromCharCode(peek));
              case $LT:
              case $GT:
              case $BANG:
              case $EQ:
                return this.scanComplexOperator(start, $EQ, StringWrapper.fromCharCode(peek), '=');
              case $AMPERSAND:
                return this.scanComplexOperator(start, $AMPERSAND, '&', '&');
              case $BAR:
                return this.scanComplexOperator(start, $BAR, '|', '|');
              case $TILDE:
                return this.scanComplexOperator(start, $SLASH, '~', '/');
              case $NBSP:
                while (isWhitespace(this.peek))
                  this.advance();
                return this.scanToken();
            }
            this.error(("Unexpected character [" + StringWrapper.fromCharCode(peek) + "]"), 0);
            return null;
          },
          scanCharacter: function(start, code) {
            assert(this.peek == code);
            this.advance();
            return newCharacterToken(start, code);
          },
          scanOperator: function(start, str) {
            assert(this.peek == StringWrapper.charCodeAt(str, 0));
            assert(SetWrapper.has(OPERATORS, str));
            this.advance();
            return newOperatorToken(start, str);
          },
          scanComplexOperator: function(start, code, one, two) {
            assert(this.peek == StringWrapper.charCodeAt(one, 0));
            this.advance();
            var str = one;
            if (this.peek == code) {
              this.advance();
              str += two;
            }
            assert(SetWrapper.has(OPERATORS, str));
            return newOperatorToken(start, str);
          },
          scanIdentifier: function() {
            assert(isIdentifierStart(this.peek));
            var start = this.index;
            this.advance();
            while (isIdentifierPart(this.peek))
              this.advance();
            var str = this.input.substring(start, this.index);
            if (SetWrapper.has(KEYWORDS, str)) {
              return newKeywordToken(start, str);
            } else {
              return newIdentifierToken(start, str);
            }
          },
          scanNumber: function(start) {
            assert(isDigit(this.peek));
            var simple = (this.index === start);
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
            var str = this.input.substring(start, this.index);
            var value = simple ? NumberWrapper.parseIntAutoRadix(str) : NumberWrapper.parseFloat(str);
            return newNumberToken(start, value);
          },
          scanString: function() {
            assert(this.peek == $SQ || this.peek == $DQ);
            var start = this.index;
            var quote = this.peek;
            this.advance();
            var buffer;
            var marker = this.index;
            var input = this.input;
            while (this.peek != quote) {
              if (this.peek == $BACKSLASH) {
                if (buffer == null)
                  buffer = new StringJoiner();
                buffer.add(input.substring(marker, this.index));
                this.advance();
                var unescapedCode;
                if (this.peek == $u) {
                  var hex = input.substring(this.index + 1, this.index + 5);
                  try {
                    unescapedCode = NumberWrapper.parseInt(hex, 16);
                  } catch (e) {
                    this.error(("Invalid unicode escape [\\u" + hex + "]"), 0);
                  }
                  for (var i = 0; i < 5; i++) {
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
            var last = input.substring(marker, this.index);
            this.advance();
            var unescaped = last;
            if (buffer != null) {
              buffer.add(last);
              unescaped = buffer.toString();
            }
            return newStringToken(start, unescaped);
          },
          error: function(message, offset) {
            var position = this.index + offset;
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

System.register("change_detection/parser/parser", ["facade/lang", "facade/collection", "./lexer", "reflection/reflection", "./ast"], function($__export) {
  "use strict";
  var __moduleName = "change_detection/parser/parser";
  function require(path) {
    return $traceurRuntime.require("change_detection/parser/parser", path);
  }
  var FIELD,
      int,
      isBlank,
      isPresent,
      BaseException,
      StringWrapper,
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
      MethodCall,
      FunctionCall,
      TemplateBindings,
      TemplateBinding,
      ASTWithSource,
      _implicitReceiver,
      Parser,
      _ParseAST;
  return {
    setters: [function(m) {
      FIELD = m.FIELD;
      int = m.int;
      isBlank = m.isBlank;
      isPresent = m.isPresent;
      BaseException = m.BaseException;
      StringWrapper = m.StringWrapper;
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
      MethodCall = m.MethodCall;
      FunctionCall = m.FunctionCall;
      TemplateBindings = m.TemplateBindings;
      TemplateBinding = m.TemplateBinding;
      ASTWithSource = m.ASTWithSource;
    }],
    execute: function() {
      _implicitReceiver = new ImplicitReceiver();
      Parser = $__export("Parser", (function() {
        var Parser = function Parser(lexer) {
          var providedReflector = arguments[1] !== (void 0) ? arguments[1] : null;
          this._lexer = lexer;
          this._reflector = isPresent(providedReflector) ? providedReflector : reflector;
        };
        return ($traceurRuntime.createClass)(Parser, {
          get _lexer() {
            return this.$__0;
          },
          set _lexer(value) {
            this.$__0 = value;
          },
          get _reflector() {
            return this.$__1;
          },
          set _reflector(value) {
            this.$__1 = value;
          },
          parseAction: function(input, location) {
            var tokens = this._lexer.tokenize(input);
            var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
            return new ASTWithSource(ast, input, location);
          },
          parseBinding: function(input, location) {
            var tokens = this._lexer.tokenize(input);
            var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
            return new ASTWithSource(ast, input, location);
          },
          parseTemplateBindings: function(input, location) {
            var tokens = this._lexer.tokenize(input);
            return new _ParseAST(input, location, tokens, this._reflector, false).parseTemplateBindings();
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
      _ParseAST = (function() {
        var _ParseAST = function _ParseAST(input, location, tokens, reflector, parseAction) {
          this.input = input;
          this.location = location;
          this.tokens = tokens;
          this.index = 0;
          this.reflector = reflector;
          this.parseAction = parseAction;
        };
        return ($traceurRuntime.createClass)(_ParseAST, {
          get input() {
            return this.$__2;
          },
          set input(value) {
            this.$__2 = value;
          },
          get location() {
            return this.$__3;
          },
          set location(value) {
            this.$__3 = value;
          },
          get tokens() {
            return this.$__4;
          },
          set tokens(value) {
            this.$__4 = value;
          },
          get reflector() {
            return this.$__5;
          },
          set reflector(value) {
            this.$__5 = value;
          },
          get parseAction() {
            return this.$__6;
          },
          set parseAction(value) {
            this.$__6 = value;
          },
          get index() {
            return this.$__7;
          },
          set index(value) {
            this.$__7 = value;
          },
          peek: function(offset) {
            var i = this.index + offset;
            return i < this.tokens.length ? this.tokens[i] : EOF;
          },
          get next() {
            return this.peek(0);
          },
          get inputIndex() {
            return (this.index < this.tokens.length) ? this.next.index : this.input.length;
          },
          advance: function() {
            this.index++;
          },
          optionalCharacter: function(code) {
            if (this.next.isCharacter(code)) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          expectCharacter: function(code) {
            if (this.optionalCharacter(code))
              return;
            this.error(("Missing expected " + StringWrapper.fromCharCode(code)));
          },
          optionalOperator: function(op) {
            if (this.next.isOperator(op)) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          expectOperator: function(operator) {
            if (this.optionalOperator(operator))
              return;
            this.error(("Missing expected operator " + operator));
          },
          expectIdentifierOrKeyword: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword()) {
              this.error(("Unexpected token " + n + ", expected identifier or keyword"));
            }
            this.advance();
            return n.toString();
          },
          expectIdentifierOrKeywordOrString: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
              this.error(("Unexpected token " + n + ", expected identifier, keyword, or string"));
            }
            this.advance();
            return n.toString();
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
              return new EmptyExpr();
            if (exprs.length == 1)
              return exprs[0];
            return new Chain(exprs);
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
                return result;
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
            var result = [];
            if (!this.next.isCharacter(terminator)) {
              do {
                ListWrapper.push(result, this.parseExpression());
              } while (this.optionalCharacter($COMMA));
            }
            return result;
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
              return new MethodCall(receiver, id, fn, args);
            } else {
              var getter = this.reflector.getter(id);
              var setter = this.reflector.setter(id);
              return new AccessMember(receiver, id, getter, setter);
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

System.register("core/compiler/pipeline/compile_control", ["facade/lang", "facade/collection", "facade/dom", "./compile_element", "./compile_step"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_control";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/compile_control", path);
  }
  var isBlank,
      List,
      ListWrapper,
      DOM,
      Element,
      CompileElement,
      CompileStep,
      CompileControl;
  return {
    setters: [function(m) {
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
          get _steps() {
            return this.$__0;
          },
          set _steps(value) {
            this.$__0 = value;
          },
          get _currentStepIndex() {
            return this.$__1;
          },
          set _currentStepIndex(value) {
            this.$__1 = value;
          },
          get _parent() {
            return this.$__2;
          },
          set _parent(value) {
            this.$__2 = value;
          },
          get _current() {
            return this.$__3;
          },
          set _current(value) {
            this.$__3 = value;
          },
          get _results() {
            return this.$__4;
          },
          set _results(value) {
            this.$__4 = value;
          },
          get _additionalChildren() {
            return this.$__5;
          },
          set _additionalChildren(value) {
            this.$__5 = value;
          },
          internalProcess: function(results, startStepIndex, parent, current) {
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
            this.internalProcess(this._results, this._currentStepIndex + 1, this._parent, newElement);
            this._parent = newElement;
          },
          addChild: function(element) {
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

System.register("core/compiler/pipeline/compile_element", ["facade/collection", "facade/dom", "facade/lang", "../directive_metadata", "../../annotations/annotations", "../element_binder", "../element_injector", "../view", "change_detection/change_detection"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_element";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/compile_element", path);
  }
  var List,
      Map,
      ListWrapper,
      MapWrapper,
      Element,
      DOM,
      int,
      isBlank,
      isPresent,
      DirectiveMetadata,
      Decorator,
      Component,
      Template,
      ElementBinder,
      ProtoElementInjector,
      ProtoView,
      ASTWithSource,
      CompileElement;
  return {
    setters: [function(m) {
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
      ASTWithSource = m.ASTWithSource;
    }],
    execute: function() {
      CompileElement = $__export("CompileElement", (function() {
        var CompileElement = function CompileElement(element) {
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
          this.isViewRoot = false;
          this.hasBindings = false;
          this.inheritedProtoView = null;
          this.inheritedProtoElementInjector = null;
          this.inheritedElementBinder = null;
        };
        return ($traceurRuntime.createClass)(CompileElement, {
          get element() {
            return this.$__0;
          },
          set element(value) {
            this.$__0 = value;
          },
          get _attrs() {
            return this.$__1;
          },
          set _attrs(value) {
            this.$__1 = value;
          },
          get _classList() {
            return this.$__2;
          },
          set _classList(value) {
            this.$__2 = value;
          },
          get textNodeBindings() {
            return this.$__3;
          },
          set textNodeBindings(value) {
            this.$__3 = value;
          },
          get propertyBindings() {
            return this.$__4;
          },
          set propertyBindings(value) {
            this.$__4 = value;
          },
          get eventBindings() {
            return this.$__5;
          },
          set eventBindings(value) {
            this.$__5 = value;
          },
          get variableBindings() {
            return this.$__6;
          },
          set variableBindings(value) {
            this.$__6 = value;
          },
          get decoratorDirectives() {
            return this.$__7;
          },
          set decoratorDirectives(value) {
            this.$__7 = value;
          },
          get templateDirective() {
            return this.$__8;
          },
          set templateDirective(value) {
            this.$__8 = value;
          },
          get componentDirective() {
            return this.$__9;
          },
          set componentDirective(value) {
            this.$__9 = value;
          },
          get isViewRoot() {
            return this.$__10;
          },
          set isViewRoot(value) {
            this.$__10 = value;
          },
          get hasBindings() {
            return this.$__11;
          },
          set hasBindings(value) {
            this.$__11 = value;
          },
          get inheritedProtoView() {
            return this.$__12;
          },
          set inheritedProtoView(value) {
            this.$__12 = value;
          },
          get inheritedProtoElementInjector() {
            return this.$__13;
          },
          set inheritedProtoElementInjector(value) {
            this.$__13 = value;
          },
          get inheritedElementBinder() {
            return this.$__14;
          },
          set inheritedElementBinder(value) {
            this.$__14 = value;
          },
          refreshAttrs: function() {
            this._attrs = null;
          },
          attrs: function() {
            if (isBlank(this._attrs)) {
              this._attrs = DOM.attributeMap(this.element);
            }
            return this._attrs;
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
            return this._classList;
          },
          addTextNodeBinding: function(indexInParent, expression) {
            if (isBlank(this.textNodeBindings)) {
              this.textNodeBindings = MapWrapper.create();
            }
            MapWrapper.set(this.textNodeBindings, indexInParent, expression);
          },
          addPropertyBinding: function(property, expression) {
            if (isBlank(this.propertyBindings)) {
              this.propertyBindings = MapWrapper.create();
            }
            MapWrapper.set(this.propertyBindings, property, expression);
          },
          addVariableBinding: function(contextName, templateName) {
            if (isBlank(this.variableBindings)) {
              this.variableBindings = MapWrapper.create();
            }
            MapWrapper.set(this.variableBindings, contextName, templateName);
          },
          addEventBinding: function(eventName, expression) {
            if (isBlank(this.eventBindings)) {
              this.eventBindings = MapWrapper.create();
            }
            MapWrapper.set(this.eventBindings, eventName, expression);
          },
          addDirective: function(directive) {
            var annotation = directive.annotation;
            if (annotation instanceof Decorator) {
              if (isBlank(this.decoratorDirectives)) {
                this.decoratorDirectives = ListWrapper.create();
              }
              ListWrapper.push(this.decoratorDirectives, directive);
            } else if (annotation instanceof Template) {
              this.templateDirective = directive;
            } else if (annotation instanceof Component) {
              this.componentDirective = directive;
            }
          }
        }, {});
      }()));
      Object.defineProperty(CompileElement, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(CompileElement.prototype.addTextNodeBinding, "parameters", {get: function() {
          return [[int], [ASTWithSource]];
        }});
      Object.defineProperty(CompileElement.prototype.addPropertyBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [ASTWithSource]];
        }});
      Object.defineProperty(CompileElement.prototype.addVariableBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [$traceurRuntime.type.string]];
        }});
      Object.defineProperty(CompileElement.prototype.addEventBinding, "parameters", {get: function() {
          return [[$traceurRuntime.type.string], [ASTWithSource]];
        }});
      Object.defineProperty(CompileElement.prototype.addDirective, "parameters", {get: function() {
          return [[DirectiveMetadata]];
        }});
    }
  };
});

System.register("core/compiler/pipeline/compile_pipeline", ["facade/lang", "facade/collection", "facade/dom", "./compile_element", "./compile_control", "./compile_step", "../directive_metadata"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_pipeline";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/compile_pipeline", path);
  }
  var isPresent,
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
          this._control = new CompileControl(steps);
        };
        return ($traceurRuntime.createClass)(CompilePipeline, {
          get _control() {
            return this.$__0;
          },
          set _control(value) {
            this.$__0 = value;
          },
          process: function(rootElement) {
            var results = ListWrapper.create();
            this._process(results, null, new CompileElement(rootElement));
            return results;
          },
          _process: function(results, parent, current) {
            var additionalChildren = this._control.internalProcess(results, 0, parent, current);
            var node = DOM.templateAwareRoot(current.element).firstChild;
            while (isPresent(node)) {
              var nextNode = DOM.nextSibling(node);
              if (node.nodeType === Node.ELEMENT_NODE) {
                this._process(results, current, new CompileElement(node));
              }
              node = nextNode;
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

System.register("core/compiler/pipeline/compile_step", ["./compile_element", "./compile_control", "../directive_metadata"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/compile_step";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/compile_step", path);
  }
  var CompileElement,
      CompileControl,
      DirectiveMetadata,
      CompileStep;
  return {
    setters: [function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }, function(m) {
      DirectiveMetadata = m.DirectiveMetadata;
    }],
    execute: function() {
      CompileStep = $__export("CompileStep", (function() {
        var CompileStep = function CompileStep() {};
        return ($traceurRuntime.createClass)(CompileStep, {process: function(parent, current, control) {}}, {});
      }()));
      Object.defineProperty(CompileStep.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});

System.register("core/compiler/pipeline/default_steps", ["change_detection/change_detection", "facade/collection", "./property_binding_parser", "./text_interpolation_parser", "./directive_parser", "./view_splitter", "./element_binding_marker", "./proto_view_builder", "./proto_element_injector_builder", "./element_binder_builder", "core/compiler/directive_metadata", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/default_steps";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/default_steps", path);
  }
  var Parser,
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
    var compilationUnit = stringify(compiledComponent.type);
    return [new ViewSplitter(parser, compilationUnit), new TextInterpolationParser(parser, compilationUnit), new PropertyBindingParser(parser, compilationUnit), new DirectiveParser(directives), new ElementBindingMarker(), new ProtoViewBuilder(), new ProtoElementInjectorBuilder(), new ElementBinderBuilder()];
  }
  $__export("createDefaultSteps", createDefaultSteps);
  return {
    setters: [function(m) {
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

System.register("core/compiler/pipeline/directive_parser", ["facade/lang", "facade/collection", "facade/dom", "../selector", "../directive_metadata", "../../annotations/annotations", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/directive_parser";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/directive_parser", path);
  }
  var isPresent,
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
          this._selectorMatcher = new SelectorMatcher();
          for (var i = 0; i < directives.length; i++) {
            var directiveMetadata = directives[i];
            this._selectorMatcher.addSelectable(CssSelector.parse(directiveMetadata.annotation.selector), directiveMetadata);
          }
        };
        return ($traceurRuntime.createClass)(DirectiveParser, {
          get _selectorMatcher() {
            return this.$__0;
          },
          set _selectorMatcher(value) {
            this.$__0 = value;
          },
          process: function(parent, current, control) {
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
          }
        }, {}, $__super);
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

System.register("core/compiler/pipeline/element_binder_builder", ["facade/lang", "facade/dom", "facade/collection", "reflection/reflection", "change_detection/change_detection", "../../annotations/annotations", "../directive_metadata", "../view", "../element_injector", "../element_binder", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/element_binder_builder";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/element_binder_builder", path);
  }
  var int,
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
      ProtoRecordRange,
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
      ProtoRecordRange = m.ProtoRecordRange;
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
              this._bindDirectiveProperties(this._collectDirectives(current), current);
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
          _collectDirectives: function(compileElement) {
            var directives;
            if (isPresent(compileElement.decoratorDirectives)) {
              directives = ListWrapper.clone(compileElement.decoratorDirectives);
            } else {
              directives = [];
            }
            if (isPresent(compileElement.templateDirective)) {
              ListWrapper.push(directives, compileElement.templateDirective);
            }
            if (isPresent(compileElement.componentDirective)) {
              ListWrapper.push(directives, compileElement.componentDirective);
            }
            return directives;
          },
          _bindDirectiveProperties: function(typesWithAnnotations, compileElement) {
            var protoView = compileElement.inheritedProtoView;
            var directiveIndex = 0;
            ListWrapper.forEach(typesWithAnnotations, (function(typeWithAnnotation) {
              var annotation = typeWithAnnotation.annotation;
              if (isBlank(annotation.bind)) {
                return;
              }
              StringMapWrapper.forEach(annotation.bind, (function(dirProp, elProp) {
                var expression = isPresent(compileElement.propertyBindings) ? MapWrapper.get(compileElement.propertyBindings, elProp) : null;
                if (isBlank(expression)) {
                  throw new BaseException('No element binding found for property ' + elProp + ' which is required by directive ' + stringify(typeWithAnnotation.type));
                }
                var len = dirProp.length;
                var dirBindingName = dirProp;
                var isContentWatch = dirProp[len - 2] === '[' && dirProp[len - 1] === ']';
                if (isContentWatch)
                  dirBindingName = dirProp.substring(0, len - 2);
                protoView.bindDirectiveProperty(directiveIndex, expression, dirBindingName, reflector.setter(dirBindingName), isContentWatch);
              }));
              directiveIndex++;
            }));
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(ElementBinderBuilder.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});

System.register("core/compiler/pipeline/element_binding_marker", ["facade/lang", "facade/collection", "facade/dom", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/element_binding_marker";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/element_binding_marker", path);
  }
  var isPresent,
      MapWrapper,
      DOM,
      CompileStep,
      CompileElement,
      CompileControl,
      NG_BINDING_CLASS,
      ElementBindingMarker;
  return {
    setters: [function(m) {
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

System.register("core/compiler/pipeline/property_binding_parser", ["facade/lang", "facade/collection", "facade/dom", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control", "./text_interpolation_parser"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/property_binding_parser";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/property_binding_parser", path);
  }
  var isPresent,
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
      interpolationToExpression,
      BIND_NAME_REGEXP,
      PropertyBindingParser;
  return {
    setters: [function(m) {
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
    }, function(m) {
      interpolationToExpression = m.interpolationToExpression;
    }],
    execute: function() {
      BIND_NAME_REGEXP = RegExpWrapper.create('^(?:(?:(bind)|(let)|(on))-(.+))|\\[([^\\]]+)\\]|\\(([^\\)]+)\\)');
      PropertyBindingParser = $__export("PropertyBindingParser", (function($__super) {
        var PropertyBindingParser = function PropertyBindingParser(parser, compilationUnit) {
          this._parser = parser;
          this._compilationUnit = compilationUnit;
        };
        return ($traceurRuntime.createClass)(PropertyBindingParser, {
          get _parser() {
            return this.$__0;
          },
          set _parser(value) {
            this.$__0 = value;
          },
          get _compilationUnit() {
            return this.$__1;
          },
          set _compilationUnit(value) {
            this.$__1 = value;
          },
          process: function(parent, current, control) {
            var $__2 = this;
            var attrs = current.attrs();
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
              if (isPresent(bindParts)) {
                if (isPresent(bindParts[1])) {
                  current.addPropertyBinding(bindParts[4], $__2._parseBinding(attrValue));
                } else if (isPresent(bindParts[2])) {
                  if (!(current.element instanceof TemplateElement)) {
                    throw new BaseException('let-* is only allowed on <template> elements!');
                  }
                  current.addVariableBinding(bindParts[4], attrValue);
                } else if (isPresent(bindParts[3])) {
                  current.addEventBinding(bindParts[4], $__2._parseAction(attrValue));
                } else if (isPresent(bindParts[5])) {
                  current.addPropertyBinding(bindParts[5], $__2._parseBinding(attrValue));
                } else if (isPresent(bindParts[6])) {
                  current.addEventBinding(bindParts[6], $__2._parseBinding(attrValue));
                }
              } else {
                var expression = interpolationToExpression(attrValue);
                if (isPresent(expression)) {
                  current.addPropertyBinding(attrName, $__2._parseBinding(expression));
                }
              }
            }));
          },
          _parseBinding: function(input) {
            return this._parser.parseBinding(input, this._compilationUnit);
          },
          _parseAction: function(input) {
            return this._parser.parseAction(input, this._compilationUnit);
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(PropertyBindingParser, "parameters", {get: function() {
          return [[Parser], [$traceurRuntime.type.any]];
        }});
      Object.defineProperty(PropertyBindingParser.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
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

System.register("core/compiler/pipeline/proto_element_injector_builder", ["facade/lang", "facade/collection", "di/di", "../element_injector", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/proto_element_injector_builder";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/proto_element_injector_builder", path);
  }
  var isPresent,
      isBlank,
      ListWrapper,
      Key,
      ProtoElementInjector,
      ComponentKeyMetaData,
      CompileStep,
      CompileElement,
      CompileControl,
      ProtoElementInjectorBuilder;
  return {
    setters: [function(m) {
      isPresent = m.isPresent;
      isBlank = m.isBlank;
    }, function(m) {
      ListWrapper = m.ListWrapper;
    }, function(m) {
      Key = m.Key;
    }, function(m) {
      ProtoElementInjector = m.ProtoElementInjector;
      ComponentKeyMetaData = m.ComponentKeyMetaData;
    }, function(m) {
      CompileStep = m.CompileStep;
    }, function(m) {
      CompileElement = m.CompileElement;
    }, function(m) {
      CompileControl = m.CompileControl;
    }],
    execute: function() {
      ProtoElementInjectorBuilder = $__export("ProtoElementInjectorBuilder", (function($__super) {
        var ProtoElementInjectorBuilder = function ProtoElementInjectorBuilder() {
          $traceurRuntime.superConstructor(ProtoElementInjectorBuilder).apply(this, arguments);
        };
        return ($traceurRuntime.createClass)(ProtoElementInjectorBuilder, {
          internalCreateProtoElementInjector: function(parent, index, directives, firstBindingIsComponent) {
            return new ProtoElementInjector(parent, index, directives, firstBindingIsComponent);
          },
          process: function(parent, current, control) {
            var inheritedProtoElementInjector = null;
            var parentProtoElementInjector = this._getParentProtoElementInjector(parent, current);
            var injectorBindings = this._collectDirectiveBindings(current);
            if (injectorBindings.length > 0) {
              var protoView = current.inheritedProtoView;
              var hasComponent = isPresent(current.componentDirective);
              inheritedProtoElementInjector = this.internalCreateProtoElementInjector(parentProtoElementInjector, protoView.elementBinders.length, injectorBindings, hasComponent);
            } else {
              inheritedProtoElementInjector = parentProtoElementInjector;
            }
            current.inheritedProtoElementInjector = inheritedProtoElementInjector;
          },
          _getParentProtoElementInjector: function(parent, current) {
            if (isPresent(parent) && !current.isViewRoot) {
              return parent.inheritedProtoElementInjector;
            }
            return null;
          },
          _collectDirectiveBindings: function(pipelineElement) {
            var directiveTypes = [];
            if (isPresent(pipelineElement.componentDirective)) {
              ListWrapper.push(directiveTypes, pipelineElement.componentDirective.type);
            }
            if (isPresent(pipelineElement.templateDirective)) {
              ListWrapper.push(directiveTypes, pipelineElement.templateDirective.type);
            }
            if (isPresent(pipelineElement.decoratorDirectives)) {
              for (var i = 0; i < pipelineElement.decoratorDirectives.length; i++) {
                ListWrapper.push(directiveTypes, pipelineElement.decoratorDirectives[i].type);
              }
            }
            return directiveTypes;
          }
        }, {}, $__super);
      }(CompileStep)));
      Object.defineProperty(ProtoElementInjectorBuilder.prototype.process, "parameters", {get: function() {
          return [[CompileElement], [CompileElement], [CompileControl]];
        }});
    }
  };
});

System.register("core/compiler/pipeline/proto_view_builder", ["facade/lang", "facade/collection", "../view", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/proto_view_builder";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/proto_view_builder", path);
  }
  var isPresent,
      BaseException,
      ListWrapper,
      MapWrapper,
      ProtoView,
      ProtoRecordRange,
      CompileStep,
      CompileElement,
      CompileControl,
      ProtoViewBuilder;
  return {
    setters: [function(m) {
      isPresent = m.isPresent;
      BaseException = m.BaseException;
    }, function(m) {
      ListWrapper = m.ListWrapper;
      MapWrapper = m.MapWrapper;
    }, function(m) {
      ProtoView = m.ProtoView;
    }, function(m) {
      ProtoRecordRange = m.ProtoRecordRange;
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
            var inheritedProtoView = null;
            if (current.isViewRoot) {
              inheritedProtoView = new ProtoView(current.element, new ProtoRecordRange());
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

System.register("core/compiler/pipeline/text_interpolation_parser", ["facade/lang", "facade/dom", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/text_interpolation_parser";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/text_interpolation_parser", path);
  }
  var RegExpWrapper,
      StringWrapper,
      isPresent,
      Node,
      DOM,
      Parser,
      CompileStep,
      CompileElement,
      CompileControl,
      INTERPOLATION_REGEXP,
      QUOTE_REGEXP,
      TextInterpolationParser;
  function interpolationToExpression(value) {
    var parts = StringWrapper.split(value, INTERPOLATION_REGEXP);
    if (parts.length <= 1) {
      return null;
    }
    var expression = '';
    for (var i = 0; i < parts.length; i++) {
      var expressionPart = null;
      if (i % 2 === 0) {
        if (parts[i].length > 0) {
          expressionPart = "'" + StringWrapper.replaceAll(parts[i], QUOTE_REGEXP, "\\'") + "'";
        }
      } else {
        expressionPart = "(" + parts[i] + ")";
      }
      if (isPresent(expressionPart)) {
        if (expression.length > 0) {
          expression += '+';
        }
        expression += expressionPart;
      }
    }
    return expression;
  }
  $__export("interpolationToExpression", interpolationToExpression);
  return {
    setters: [function(m) {
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
      INTERPOLATION_REGEXP = RegExpWrapper.create('\\{\\{(.*?)\\}\\}');
      QUOTE_REGEXP = RegExpWrapper.create("'");
      Object.defineProperty(interpolationToExpression, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
      TextInterpolationParser = $__export("TextInterpolationParser", (function($__super) {
        var TextInterpolationParser = function TextInterpolationParser(parser, compilationUnit) {
          this._parser = parser;
          this._compilationUnit = compilationUnit;
        };
        return ($traceurRuntime.createClass)(TextInterpolationParser, {
          get _parser() {
            return this.$__0;
          },
          set _parser(value) {
            this.$__0 = value;
          },
          get _compilationUnit() {
            return this.$__1;
          },
          set _compilationUnit(value) {
            this.$__1 = value;
          },
          process: function(parent, current, control) {
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
            var expression = interpolationToExpression(node.nodeValue);
            if (isPresent(expression)) {
              DOM.setText(node, ' ');
              pipelineElement.addTextNodeBinding(nodeIndex, this._parser.parseBinding(expression, this._compilationUnit));
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

System.register("core/compiler/pipeline/view_splitter", ["facade/lang", "facade/dom", "facade/collection", "change_detection/change_detection", "./compile_step", "./compile_element", "./compile_control"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/pipeline/view_splitter";
  function require(path) {
    return $traceurRuntime.require("core/compiler/pipeline/view_splitter", path);
  }
  var isBlank,
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
          this._parser = parser;
          this._compilationUnit = compilationUnit;
        };
        return ($traceurRuntime.createClass)(ViewSplitter, {
          get _parser() {
            return this.$__0;
          },
          set _parser(value) {
            this.$__0 = value;
          },
          get _compilationUnit() {
            return this.$__1;
          },
          set _compilationUnit(value) {
            this.$__1 = value;
          },
          process: function(parent, current, control) {
            if (isBlank(parent)) {
              current.isViewRoot = true;
            } else {
              if (current.element instanceof TemplateElement) {
                if (!current.isViewRoot) {
                  var viewRoot = new CompileElement(DOM.createTemplate(''));
                  var currentElement = current.element;
                  var viewRootElement = viewRoot.element;
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
            DOM.parentElement(currentElement).insertBefore(newParentElement, currentElement);
            DOM.appendChild(newParentElement, currentElement);
          },
          _parseTemplateBindings: function(templateBindings, compileElement) {
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

System.register("core/application", ["di/di", "facade/lang", "facade/dom", "./compiler/compiler", "./compiler/view", "reflection/reflection", "change_detection/change_detection", "./compiler/template_loader", "./compiler/directive_metadata_reader", "./compiler/directive_metadata", "facade/collection", "facade/async", "core/zone/vm_turn_zone", "core/life_cycle/life_cycle"], function($__export) {
  "use strict";
  var __moduleName = "core/application";
  function require(path) {
    return $traceurRuntime.require("core/application", path);
  }
  var Injector,
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
      RecordRange,
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
      appRecordRangeToken,
      appElementToken,
      appComponentAnnotatedTypeToken,
      appDocumentToken;
  function documentDependentBindings(appComponentType) {
    return [bind(appComponentAnnotatedTypeToken).toFactory((function(reader) {
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
    }), [Compiler, Injector, appElementToken, appComponentAnnotatedTypeToken]), bind(appRecordRangeToken).toFactory((function(rootView) {
      return rootView.recordRange;
    }), [appViewToken]), bind(ChangeDetector).toFactory((function(appRecordRange) {
      return new ChangeDetector(appRecordRange, assertionsEnabled());
    }), [appRecordRangeToken]), bind(appComponentType).toFactory((function(rootView) {
      return rootView.elementInjectors[0].getComponent();
    }), [appViewToken]), bind(LifeCycle).toClass(LifeCycle)];
  }
  function _injectorBindings(appComponentType) {
    return ListWrapper.concat([bind(appDocumentToken).toValue(DOM.defaultDoc())], documentDependentBindings(appComponentType));
  }
  function _createVmZone(givenReporter) {
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
    var bootstrapProcess = PromiseWrapper.completer();
    var zone = _createVmZone(givenBootstrapErrorReporter);
    zone.run((function() {
      if (isBlank(_rootInjector))
        _rootInjector = new Injector(_rootBindings);
      var appInjector = _rootInjector.createChild(_injectorBindings(appComponentType));
      if (isPresent(bindings))
        appInjector = appInjector.createChild(bindings);
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
  $__export("documentDependentBindings", documentDependentBindings);
  $__export("bootstrap", bootstrap);
  return {
    setters: [function(m) {
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
      RecordRange = m.RecordRange;
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
      appRecordRangeToken = $__export("appRecordRangeToken", new OpaqueToken('AppRecordRange'));
      appElementToken = $__export("appElementToken", new OpaqueToken('AppElement'));
      appComponentAnnotatedTypeToken = $__export("appComponentAnnotatedTypeToken", new OpaqueToken('AppComponentAnnotatedType'));
      appDocumentToken = $__export("appDocumentToken", new OpaqueToken('AppDocument'));
      Object.defineProperty(_createVmZone, "parameters", {get: function() {
          return [[Function]];
        }});
      Object.defineProperty(bootstrap, "parameters", {get: function() {
          return [[Type], [], []];
        }});
    }
  };
});

System.register("core/core", ["./annotations/annotations", "./compiler/interfaces", "./annotations/template_config", "./application", "change_detection/change_detection", "./compiler/compiler", "./compiler/template_loader", "./compiler/view", "./compiler/viewport", "core/dom/element"], function($__export) {
  "use strict";
  var __moduleName = "core/core";
  function require(path) {
    return $traceurRuntime.require("core/core", path);
  }
  return {
    setters: [function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }, function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }],
    execute: function() {}
  };
});

System.register("core/annotations/annotations", ["facade/lang", "facade/collection", "./template_config", "../compiler/shadow_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/annotations/annotations";
  function require(path) {
    return $traceurRuntime.require("core/annotations/annotations", path);
  }
  var ABSTRACT,
      CONST,
      normalizeBlank,
      List,
      TemplateConfig,
      ShadowDomStrategy,
      Directive,
      Component,
      Decorator,
      Template;
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
          var $__10 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__10.selector,
              bind = $__10.bind,
              lightDomServices = $__10.lightDomServices,
              implementsTypes = $__10.implementsTypes;
          this.selector = selector;
          this.lightDomServices = lightDomServices;
          this.implementsTypes = implementsTypes;
          this.bind = bind;
        };
        return ($traceurRuntime.createClass)(Directive, {
          get selector() {
            return this.$__0;
          },
          set selector(value) {
            this.$__0 = value;
          },
          get bind() {
            return this.$__1;
          },
          set bind(value) {
            this.$__1 = value;
          },
          get lightDomServices() {
            return this.$__2;
          },
          set lightDomServices(value) {
            this.$__2 = value;
          },
          get implementsTypes() {
            return this.$__3;
          },
          set implementsTypes(value) {
            this.$__3 = value;
          }
        }, {});
      }()));
      Object.defineProperty(Directive, "annotations", {get: function() {
          return [new ABSTRACT(), new CONST()];
        }});
      Component = $__export("Component", (function($__super) {
        var Component = function Component() {
          var $__10 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__10.selector,
              bind = $__10.bind,
              template = $__10.template,
              lightDomServices = $__10.lightDomServices,
              shadowDomServices = $__10.shadowDomServices,
              componentServices = $__10.componentServices,
              implementsTypes = $__10.implementsTypes,
              shadowDom = $__10.shadowDom;
          $traceurRuntime.superConstructor(Component).call(this, {
            selector: selector,
            bind: bind,
            lightDomServices: lightDomServices,
            implementsTypes: implementsTypes
          });
          this.template = template;
          this.lightDomServices = lightDomServices;
          this.shadowDomServices = shadowDomServices;
          this.componentServices = componentServices;
          this.shadowDom = shadowDom;
        };
        return ($traceurRuntime.createClass)(Component, {
          get template() {
            return this.$__4;
          },
          set template(value) {
            this.$__4 = value;
          },
          get lightDomServices() {
            return this.$__5;
          },
          set lightDomServices(value) {
            this.$__5 = value;
          },
          get shadowDomServices() {
            return this.$__6;
          },
          set shadowDomServices(value) {
            this.$__6 = value;
          },
          get componentServices() {
            return this.$__7;
          },
          set componentServices(value) {
            this.$__7 = value;
          },
          get shadowDom() {
            return this.$__8;
          },
          set shadowDom(value) {
            this.$__8 = value;
          }
        }, {}, $__super);
      }(Directive)));
      Object.defineProperty(Component, "annotations", {get: function() {
          return [new CONST()];
        }});
      Decorator = $__export("Decorator", (function($__super) {
        var Decorator = function Decorator() {
          var $__10 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__10.selector,
              bind = $__10.bind,
              lightDomServices = $__10.lightDomServices,
              implementsTypes = $__10.implementsTypes;
          $traceurRuntime.superConstructor(Decorator).call(this, {
            selector: selector,
            bind: bind,
            lightDomServices: lightDomServices,
            implementsTypes: implementsTypes
          });
        };
        return ($traceurRuntime.createClass)(Decorator, {}, {}, $__super);
      }(Directive)));
      Object.defineProperty(Decorator, "annotations", {get: function() {
          return [new CONST()];
        }});
      Template = $__export("Template", (function($__super) {
        var Template = function Template() {
          var $__10 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__10.selector,
              bind = $__10.bind,
              lightDomServices = $__10.lightDomServices,
              implementsTypes = $__10.implementsTypes;
          $traceurRuntime.superConstructor(Template).call(this, {
            selector: selector,
            bind: bind,
            lightDomServices: lightDomServices,
            implementsTypes: implementsTypes
          });
        };
        return ($traceurRuntime.createClass)(Template, {}, {}, $__super);
      }(Directive)));
      Object.defineProperty(Template, "annotations", {get: function() {
          return [new CONST()];
        }});
    }
  };
});

System.register("core/annotations/template_config", ["facade/lang", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "core/annotations/template_config";
  function require(path) {
    return $traceurRuntime.require("core/annotations/template_config", path);
  }
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
        var TemplateConfig = function TemplateConfig($__6) {
          var $__7 = $__6,
              url = $__7.url,
              inline = $__7.inline,
              directives = $__7.directives,
              formatters = $__7.formatters,
              source = $__7.source;
          this.url = url;
          this.inline = inline;
          this.directives = directives;
          this.formatters = formatters;
          this.source = source;
        };
        return ($traceurRuntime.createClass)(TemplateConfig, {
          get url() {
            return this.$__0;
          },
          set url(value) {
            this.$__0 = value;
          },
          get inline() {
            return this.$__1;
          },
          set inline(value) {
            this.$__1 = value;
          },
          get directives() {
            return this.$__2;
          },
          set directives(value) {
            this.$__2 = value;
          },
          get formatters() {
            return this.$__3;
          },
          set formatters(value) {
            this.$__3 = value;
          },
          get source() {
            return this.$__4;
          },
          set source(value) {
            this.$__4 = value;
          }
        }, {});
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
  function require(path) {
    return $traceurRuntime.require("core/annotations/visibility", path);
  }
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

System.register("core/dom/element", ["facade/dom"], function($__export) {
  "use strict";
  var __moduleName = "core/dom/element";
  function require(path) {
    return $traceurRuntime.require("core/dom/element", path);
  }
  var Element,
      NgElement;
  return {
    setters: [function(m) {
      Element = m.Element;
    }],
    execute: function() {
      NgElement = $__export("NgElement", (function() {
        var NgElement = function NgElement(domElement) {
          this.domElement = domElement;
        };
        return ($traceurRuntime.createClass)(NgElement, {
          get domElement() {
            return this.$__0;
          },
          set domElement(value) {
            this.$__0 = value;
          }
        }, {});
      }()));
      Object.defineProperty(NgElement, "parameters", {get: function() {
          return [[Element]];
        }});
    }
  };
});

System.register("core/compiler/annotated_type", ["facade/lang", "../annotations/annotations"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/annotated_type";
  function require(path) {
    return $traceurRuntime.require("core/compiler/annotated_type", path);
  }
  var Type,
      FIELD,
      Directive,
      AnnotatedType;
  return {
    setters: [function(m) {
      Type = m.Type;
      FIELD = m.FIELD;
    }, function(m) {
      Directive = m.Directive;
    }],
    execute: function() {
      AnnotatedType = $__export("AnnotatedType", (function() {
        var AnnotatedType = function AnnotatedType(type, annotation) {
          this.annotation = annotation;
          this.type = type;
        };
        return ($traceurRuntime.createClass)(AnnotatedType, {
          get type() {
            return this.$__0;
          },
          set type(value) {
            this.$__0 = value;
          },
          get annotation() {
            return this.$__1;
          },
          set annotation(value) {
            this.$__1 = value;
          }
        }, {});
      }()));
      Object.defineProperty(AnnotatedType, "parameters", {get: function() {
          return [[Type], [Directive]];
        }});
    }
  };
});

System.register("core/compiler/compiler", ["facade/lang", "facade/async", "facade/collection", "facade/dom", "change_detection/change_detection", "./directive_metadata_reader", "./view", "./pipeline/compile_pipeline", "./pipeline/compile_element", "./pipeline/default_steps", "./template_loader", "./directive_metadata", "../annotations/annotations"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/compiler";
  function require(path) {
    return $traceurRuntime.require("core/compiler/compiler", path);
  }
  var Type,
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
      CompilerCache,
      Compiler;
  return {
    setters: [function(m) {
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
    }],
    execute: function() {
      CompilerCache = $__export("CompilerCache", (function() {
        var CompilerCache = function CompilerCache() {
          this._cache = MapWrapper.create();
        };
        return ($traceurRuntime.createClass)(CompilerCache, {
          get _cache() {
            return this.$__0;
          },
          set _cache(value) {
            this.$__0 = value;
          },
          set: function(component, protoView) {
            MapWrapper.set(this._cache, component, protoView);
          },
          get: function(component) {
            var result = MapWrapper.get(this._cache, component);
            if (isBlank(result)) {
              return null;
            }
            return result;
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
          this._templateLoader = templateLoader;
          this._reader = reader;
          this._parser = parser;
          this._compilerCache = cache;
        };
        return ($traceurRuntime.createClass)(Compiler, {
          get _templateLoader() {
            return this.$__1;
          },
          set _templateLoader(value) {
            this.$__1 = value;
          },
          get _reader() {
            return this.$__2;
          },
          set _reader(value) {
            this.$__2 = value;
          },
          get _parser() {
            return this.$__3;
          },
          set _parser(value) {
            this.$__3 = value;
          },
          get _compilerCache() {
            return this.$__4;
          },
          set _compilerCache(value) {
            this.$__4 = value;
          },
          createSteps: function(component) {
            var annotation = component.annotation;
            var directives = annotation.template.directives;
            var annotatedDirectives = ListWrapper.create();
            for (var i = 0; i < directives.length; i++) {
              ListWrapper.push(annotatedDirectives, this._reader.read(directives[i]));
            }
            return createDefaultSteps(this._parser, component, annotatedDirectives);
          },
          compile: function(component) {
            var templateRoot = arguments[1] !== (void 0) ? arguments[1] : null;
            var templateCache = null;
            return PromiseWrapper.resolve(this.compileAllLoaded(templateCache, this._reader.read(component), templateRoot));
          },
          compileAllLoaded: function(templateCache, component) {
            var templateRoot = arguments[2] !== (void 0) ? arguments[2] : null;
            var rootProtoView = this._compilerCache.get(component.type);
            if (isPresent(rootProtoView)) {
              return rootProtoView;
            }
            if (isBlank(templateRoot)) {
              var annotation = component.annotation;
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
            return rootProtoView;
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




System.register("core/compiler/directive_metadata", ["facade/lang", "../annotations/annotations", "./shadow_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/directive_metadata";
  function require(path) {
    return $traceurRuntime.require("core/compiler/directive_metadata", path);
  }
  var Type,
      FIELD,
      Directive,
      ShadowDomStrategy,
      DirectiveMetadata;
  return {
    setters: [function(m) {
      Type = m.Type;
      FIELD = m.FIELD;
    }, function(m) {
      Directive = m.Directive;
    }, function(m) {
      ShadowDomStrategy = m.ShadowDomStrategy;
    }],
    execute: function() {
      DirectiveMetadata = $__export("DirectiveMetadata", (function() {
        var DirectiveMetadata = function DirectiveMetadata(type, annotation, shadowDomStrategy) {
          this.annotation = annotation;
          this.type = type;
          this.shadowDomStrategy = shadowDomStrategy;
        };
        return ($traceurRuntime.createClass)(DirectiveMetadata, {
          get type() {
            return this.$__0;
          },
          set type(value) {
            this.$__0 = value;
          },
          get annotation() {
            return this.$__1;
          },
          set annotation(value) {
            this.$__1 = value;
          },
          get shadowDomStrategy() {
            return this.$__2;
          },
          set shadowDomStrategy(value) {
            this.$__2 = value;
          }
        }, {});
      }()));
      Object.defineProperty(DirectiveMetadata, "parameters", {get: function() {
          return [[Type], [Directive], [ShadowDomStrategy]];
        }});
    }
  };
});




System.register("core/compiler/directive_metadata_reader", ["facade/lang", "../annotations/annotations", "./directive_metadata", "reflection/reflection", "./shadow_dom"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/directive_metadata_reader";
  function require(path) {
    return $traceurRuntime.require("core/compiler/directive_metadata_reader", path);
  }
  var Type,
      isPresent,
      BaseException,
      stringify,
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
      Type = m.Type;
      isPresent = m.isPresent;
      BaseException = m.BaseException;
      stringify = m.stringify;
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
            var annotations = reflector.annotations(type);
            if (isPresent(annotations)) {
              for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof Component) {
                  return new DirectiveMetadata(type, annotation, this.parseShadowDomStrategy(annotation));
                }
                if (annotation instanceof Directive) {
                  return new DirectiveMetadata(type, annotation, null);
                }
              }
            }
            throw new BaseException(("No Directive annotation found on " + stringify(type)));
          },
          parseShadowDomStrategy: function(annotation) {
            return isPresent(annotation.shadowDom) ? annotation.shadowDom : ShadowDomNative;
          }
        }, {});
      }()));
      Object.defineProperty(DirectiveMetadataReader.prototype.read, "parameters", {get: function() {
          return [[Type]];
        }});
      Object.defineProperty(DirectiveMetadataReader.prototype.parseShadowDomStrategy, "parameters", {get: function() {
          return [[Component]];
        }});
    }
  };
});




System.register("core/compiler/element_binder", ["./element_injector", "facade/lang", "facade/collection", "./directive_metadata", "./view"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/element_binder";
  function require(path) {
    return $traceurRuntime.require("core/compiler/element_binder", path);
  }
  var ProtoElementInjector,
      FIELD,
      MapWrapper,
      DirectiveMetadata,
      List,
      Map,
      ProtoView,
      ElementBinder;
  return {
    setters: [function(m) {
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
          this.protoElementInjector = protoElementInjector;
          this.componentDirective = componentDirective;
          this.templateDirective = templateDirective;
          this.events = null;
          this.textNodeIndices = null;
          this.hasElementPropertyBindings = false;
          this.nestedProtoView = null;
        };
        return ($traceurRuntime.createClass)(ElementBinder, {
          get protoElementInjector() {
            return this.$__0;
          },
          set protoElementInjector(value) {
            this.$__0 = value;
          },
          get componentDirective() {
            return this.$__1;
          },
          set componentDirective(value) {
            this.$__1 = value;
          },
          get templateDirective() {
            return this.$__2;
          },
          set templateDirective(value) {
            this.$__2 = value;
          },
          get textNodeIndices() {
            return this.$__3;
          },
          set textNodeIndices(value) {
            this.$__3 = value;
          },
          get hasElementPropertyBindings() {
            return this.$__4;
          },
          set hasElementPropertyBindings(value) {
            this.$__4 = value;
          },
          get nestedProtoView() {
            return this.$__5;
          },
          set nestedProtoView(value) {
            this.$__5 = value;
          },
          get events() {
            return this.$__6;
          },
          set events(value) {
            this.$__6 = value;
          }
        }, {});
      }()));
      Object.defineProperty(ElementBinder, "parameters", {get: function() {
          return [[ProtoElementInjector], [DirectiveMetadata], [DirectiveMetadata]];
        }});
    }
  };
});




System.register("core/compiler/element_injector", ["facade/lang", "facade/math", "facade/collection", "di/di", "core/annotations/visibility", "core/compiler/view", "core/compiler/viewport", "core/dom/element"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/element_injector";
  function require(path) {
    return $traceurRuntime.require("core/compiler/element_injector", path);
  }
  var FIELD,
      isPresent,
      isBlank,
      Type,
      int,
      BaseException,
      Math,
      List,
      ListWrapper,
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
      View,
      ViewPort,
      NgElement,
      _MAX_DIRECTIVE_CONSTRUCTION_COUNTER,
      MAX_DEPTH,
      _undefined,
      _staticKeys,
      StaticKeys,
      TreeNode,
      DirectiveDependency,
      PreBuiltObjects,
      ProtoElementInjector,
      ElementInjector,
      OutOfBoundsAccess;
  return {
    setters: [function(m) {
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
      View = m.View;
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
        };
        return ($traceurRuntime.createClass)(StaticKeys, {
          get viewId() {
            return this.$__0;
          },
          set viewId(value) {
            this.$__0 = value;
          },
          get ngElementId() {
            return this.$__1;
          },
          set ngElementId(value) {
            this.$__1 = value;
          },
          get viewPortId() {
            return this.$__2;
          },
          set viewPortId(value) {
            this.$__2 = value;
          }
        }, {instance: function() {
            if (isBlank(_staticKeys))
              _staticKeys = new StaticKeys();
            return _staticKeys;
          }});
      }());
      TreeNode = (function() {
        var TreeNode = function TreeNode(parent) {
          this._parent = parent;
          this._head = null;
          this._tail = null;
          this._next = null;
          this._prev = null;
          if (isPresent(parent))
            parent._addChild(this);
        };
        return ($traceurRuntime.createClass)(TreeNode, {
          get _parent() {
            return this.$__3;
          },
          set _parent(value) {
            this.$__3 = value;
          },
          get _head() {
            return this.$__4;
          },
          set _head(value) {
            this.$__4 = value;
          },
          get _tail() {
            return this.$__5;
          },
          set _tail(value) {
            this.$__5 = value;
          },
          get _next() {
            return this.$__6;
          },
          set _next(value) {
            this.$__6 = value;
          },
          get _prev() {
            return this.$__7;
          },
          set _prev(value) {
            this.$__7 = value;
          },
          _addChild: function(child) {
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
      DirectiveDependency = (function($__super) {
        var DirectiveDependency = function DirectiveDependency(key, asPromise, lazy, properties, depth) {
          $traceurRuntime.superConstructor(DirectiveDependency).call(this, key, asPromise, lazy, properties);
          this.depth = depth;
        };
        return ($traceurRuntime.createClass)(DirectiveDependency, {
          get depth() {
            return this.$__8;
          },
          set depth(value) {
            this.$__8 = value;
          }
        }, {
          createFrom: function(d) {
            return new DirectiveDependency(d.key, d.asPromise, d.lazy, d.properties, DirectiveDependency._depth(d.properties));
          },
          _depth: function(properties) {
            if (properties.length == 0)
              return 0;
            if (ListWrapper.any(properties, (function(p) {
              return p instanceof Parent;
            })))
              return 1;
            if (ListWrapper.any(properties, (function(p) {
              return p instanceof Ancestor;
            })))
              return MAX_DEPTH;
            return 0;
          }
        }, $__super);
      }(Dependency));
      Object.defineProperty(DirectiveDependency, "parameters", {get: function() {
          return [[Key], [$traceurRuntime.type.boolean], [$traceurRuntime.type.boolean], [List], [int]];
        }});
      Object.defineProperty(DirectiveDependency.createFrom, "parameters", {get: function() {
          return [[Dependency]];
        }});
      PreBuiltObjects = $__export("PreBuiltObjects", (function() {
        var PreBuiltObjects = function PreBuiltObjects(view, element, viewPort) {
          this.view = view;
          this.element = element;
          this.viewPort = viewPort;
        };
        return ($traceurRuntime.createClass)(PreBuiltObjects, {
          get view() {
            return this.$__9;
          },
          set view(value) {
            this.$__9 = value;
          },
          get element() {
            return this.$__10;
          },
          set element(value) {
            this.$__10 = value;
          },
          get viewPort() {
            return this.$__11;
          },
          set viewPort(value) {
            this.$__11 = value;
          }
        }, {});
      }()));
      Object.defineProperty(PreBuiltObjects, "parameters", {get: function() {
          return [[], [NgElement], [ViewPort]];
        }});
      ProtoElementInjector = $__export("ProtoElementInjector", (function() {
        var ProtoElementInjector = function ProtoElementInjector(parent, index, bindings) {
          var firstBindingIsComponent = arguments[3] !== (void 0) ? arguments[3] : false;
          this.parent = parent;
          this.index = index;
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
          get _binding0() {
            return this.$__12;
          },
          set _binding0(value) {
            this.$__12 = value;
          },
          get _binding1() {
            return this.$__13;
          },
          set _binding1(value) {
            this.$__13 = value;
          },
          get _binding2() {
            return this.$__14;
          },
          set _binding2(value) {
            this.$__14 = value;
          },
          get _binding3() {
            return this.$__15;
          },
          set _binding3(value) {
            this.$__15 = value;
          },
          get _binding4() {
            return this.$__16;
          },
          set _binding4(value) {
            this.$__16 = value;
          },
          get _binding5() {
            return this.$__17;
          },
          set _binding5(value) {
            this.$__17 = value;
          },
          get _binding6() {
            return this.$__18;
          },
          set _binding6(value) {
            this.$__18 = value;
          },
          get _binding7() {
            return this.$__19;
          },
          set _binding7(value) {
            this.$__19 = value;
          },
          get _binding8() {
            return this.$__20;
          },
          set _binding8(value) {
            this.$__20 = value;
          },
          get _binding9() {
            return this.$__21;
          },
          set _binding9(value) {
            this.$__21 = value;
          },
          get _binding0IsComponent() {
            return this.$__22;
          },
          set _binding0IsComponent(value) {
            this.$__22 = value;
          },
          get _keyId0() {
            return this.$__23;
          },
          set _keyId0(value) {
            this.$__23 = value;
          },
          get _keyId1() {
            return this.$__24;
          },
          set _keyId1(value) {
            this.$__24 = value;
          },
          get _keyId2() {
            return this.$__25;
          },
          set _keyId2(value) {
            this.$__25 = value;
          },
          get _keyId3() {
            return this.$__26;
          },
          set _keyId3(value) {
            this.$__26 = value;
          },
          get _keyId4() {
            return this.$__27;
          },
          set _keyId4(value) {
            this.$__27 = value;
          },
          get _keyId5() {
            return this.$__28;
          },
          set _keyId5(value) {
            this.$__28 = value;
          },
          get _keyId6() {
            return this.$__29;
          },
          set _keyId6(value) {
            this.$__29 = value;
          },
          get _keyId7() {
            return this.$__30;
          },
          set _keyId7(value) {
            this.$__30 = value;
          },
          get _keyId8() {
            return this.$__31;
          },
          set _keyId8(value) {
            this.$__31 = value;
          },
          get _keyId9() {
            return this.$__32;
          },
          set _keyId9(value) {
            this.$__32 = value;
          },
          get parent() {
            return this.$__33;
          },
          set parent(value) {
            this.$__33 = value;
          },
          get index() {
            return this.$__34;
          },
          set index(value) {
            this.$__34 = value;
          },
          get view() {
            return this.$__35;
          },
          set view(value) {
            this.$__35 = value;
          },
          instantiate: function(parent, host) {
            return new ElementInjector(this, parent, host);
          },
          _createBinding: function(bindingOrType) {
            var b = (bindingOrType instanceof Type) ? bind(bindingOrType).toClass(bindingOrType) : bindingOrType;
            var deps = ListWrapper.map(b.dependencies, DirectiveDependency.createFrom);
            return new Binding(b.key, b.factory, deps, b.providedAsPromise);
          },
          get hasBindings() {
            return isPresent(this._binding0);
          }
        }, {});
      }()));
      Object.defineProperty(ProtoElementInjector, "parameters", {get: function() {
          return [[ProtoElementInjector], [int], [List], [$traceurRuntime.type.boolean]];
        }});
      Object.defineProperty(ProtoElementInjector.prototype.instantiate, "parameters", {get: function() {
          return [[ElementInjector], [ElementInjector]];
        }});
      ElementInjector = $__export("ElementInjector", (function($__super) {
        var ElementInjector = function ElementInjector(proto, parent, host) {
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
          get _proto() {
            return this.$__36;
          },
          set _proto(value) {
            this.$__36 = value;
          },
          get _lightDomAppInjector() {
            return this.$__37;
          },
          set _lightDomAppInjector(value) {
            this.$__37 = value;
          },
          get _shadowDomAppInjector() {
            return this.$__38;
          },
          set _shadowDomAppInjector(value) {
            this.$__38 = value;
          },
          get _host() {
            return this.$__39;
          },
          set _host(value) {
            this.$__39 = value;
          },
          get _obj0() {
            return this.$__40;
          },
          set _obj0(value) {
            this.$__40 = value;
          },
          get _obj1() {
            return this.$__41;
          },
          set _obj1(value) {
            this.$__41 = value;
          },
          get _obj2() {
            return this.$__42;
          },
          set _obj2(value) {
            this.$__42 = value;
          },
          get _obj3() {
            return this.$__43;
          },
          set _obj3(value) {
            this.$__43 = value;
          },
          get _obj4() {
            return this.$__44;
          },
          set _obj4(value) {
            this.$__44 = value;
          },
          get _obj5() {
            return this.$__45;
          },
          set _obj5(value) {
            this.$__45 = value;
          },
          get _obj6() {
            return this.$__46;
          },
          set _obj6(value) {
            this.$__46 = value;
          },
          get _obj7() {
            return this.$__47;
          },
          set _obj7(value) {
            this.$__47 = value;
          },
          get _obj8() {
            return this.$__48;
          },
          set _obj8(value) {
            this.$__48 = value;
          },
          get _obj9() {
            return this.$__49;
          },
          set _obj9(value) {
            this.$__49 = value;
          },
          get _view() {
            return this.$__50;
          },
          set _view(value) {
            this.$__50 = value;
          },
          get _preBuiltObjects() {
            return this.$__51;
          },
          set _preBuiltObjects(value) {
            this.$__51 = value;
          },
          get _constructionCounter() {
            return this.$__52;
          },
          set _constructionCounter(value) {
            this.$__52 = value;
          },
          clearDirectives: function() {
            this._preBuiltObjects = null;
            this._lightDomAppInjector = null;
            this._shadowDomAppInjector = null;
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
            if (this._proto._binding0IsComponent && isBlank(shadowDomAppInjector)) {
              throw new BaseException('A shadowDomAppInjector is required as this ElementInjector contains a component');
            } else if (!this._proto._binding0IsComponent && isPresent(shadowDomAppInjector)) {
              throw new BaseException('No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
            }
          },
          get: function(token) {
            return this._getByKey(Key.get(token), 0, null);
          },
          getComponent: function() {
            if (this._proto._binding0IsComponent) {
              return this._obj0;
            } else {
              throw new BaseException('There is not component stored in this ElementInjector');
            }
          },
          _isComponentKey: function(key) {
            return this._proto._binding0IsComponent && key.id === this._proto._keyId0;
          },
          _new: function(binding) {
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
            return this._getByKey(dep.key, dep.depth, requestor);
          },
          _getByKey: function(key, depth, requestor) {
            var ei = this;
            if (!this._shouldIncludeSelf(depth)) {
              depth -= 1;
              ei = ei._parent;
            }
            while (ei != null && depth >= 0) {
              var preBuiltObj = ei._getPreBuiltObjectByKeyId(key.id);
              if (preBuiltObj !== _undefined)
                return preBuiltObj;
              var dir = ei._getDirectiveByKeyId(key.id);
              if (dir !== _undefined)
                return dir;
              ei = ei._parent;
              depth -= 1;
            }
            if (isPresent(this._host) && this._host._isComponentKey(key)) {
              return this._host.getComponent();
            } else {
              return this._appInjector(requestor).get(key);
            }
          },
          _appInjector: function(requestor) {
            if (isPresent(requestor) && this._isComponentKey(requestor)) {
              return this._shadowDomAppInjector;
            } else {
              return this._lightDomAppInjector;
            }
          },
          _shouldIncludeSelf: function(depth) {
            return depth === 0;
          },
          _getPreBuiltObjectByKeyId: function(keyId) {
            var staticKeys = StaticKeys.instance();
            if (keyId === staticKeys.viewId)
              return this._preBuiltObjects.view;
            if (keyId === staticKeys.ngElementId)
              return this._preBuiltObjects.element;
            if (keyId === staticKeys.viewPortId) {
              if (isBlank(staticKeys.viewPortId))
                throw new BaseException('ViewPort is constructed only for @Template directives');
              return this._preBuiltObjects.viewPort;
            }
            return _undefined;
          },
          _getDirectiveByKeyId: function(keyId) {
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
          }
        }, {}, $__super);
      }(TreeNode)));
      Object.defineProperty(ElementInjector, "parameters", {get: function() {
          return [[ProtoElementInjector], [ElementInjector], [ElementInjector]];
        }});
      Object.defineProperty(ElementInjector.prototype.instantiateDirectives, "parameters", {get: function() {
          return [[Injector], [Injector], [PreBuiltObjects]];
        }});
      Object.defineProperty(ElementInjector.prototype._checkShadowDomAppInjector, "parameters", {get: function() {
          return [[Injector]];
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
          return [[Key], [int], [Key]];
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
      OutOfBoundsAccess = (function($__super) {
        var OutOfBoundsAccess = function OutOfBoundsAccess(index) {
          this.message = ("Index " + index + " is out-of-bounds.");
        };
        return ($traceurRuntime.createClass)(OutOfBoundsAccess, {
          get message() {
            return this.$__53;
          },
          set message(value) {
            this.$__53 = value;
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(Error));
    }
  };
});




System.register("core/compiler/interfaces", [], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/interfaces";
  function require(path) {
    return $traceurRuntime.require("core/compiler/interfaces", path);
  }
  var OnChange;
  return {
    setters: [],
    execute: function() {
      OnChange = $__export("OnChange", (function() {
        var OnChange = function OnChange() {};
        return ($traceurRuntime.createClass)(OnChange, {onChange: function(changes) {
            throw "not implemented";
          }}, {});
      }()));
    }
  };
});




System.register("core/compiler/selector", ["facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/selector";
  function require(path) {
    return $traceurRuntime.require("core/compiler/selector", path);
  }
  var List,
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
          get element() {
            return this.$__0;
          },
          set element(value) {
            this.$__0 = value;
          },
          get classNames() {
            return this.$__1;
          },
          set classNames(value) {
            this.$__1 = value;
          },
          get attrs() {
            return this.$__2;
          },
          set attrs(value) {
            this.$__2 = value;
          },
          setElement: function() {
            var element = arguments[0] !== (void 0) ? arguments[0] : null;
            if (isPresent(element)) {
              element = element.toLowerCase();
            }
            this.element = element;
          },
          addAttribute: function(name) {
            var value = arguments[1] !== (void 0) ? arguments[1] : _EMPTY_ATTR_VALUE;
            ListWrapper.push(this.attrs, name.toLowerCase());
            if (isPresent(value)) {
              value = value.toLowerCase();
            } else {
              value = _EMPTY_ATTR_VALUE;
            }
            ListWrapper.push(this.attrs, value);
          },
          addClassName: function(name) {
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
            return res;
          }
        }, {parse: function(selector) {
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
            return cssSelector;
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
          get _selectables() {
            return this.$__3;
          },
          set _selectables(value) {
            this.$__3 = value;
          },
          get _elementMap() {
            return this.$__4;
          },
          set _elementMap(value) {
            this.$__4 = value;
          },
          get _elementPartialMap() {
            return this.$__5;
          },
          set _elementPartialMap(value) {
            this.$__5 = value;
          },
          get _classMap() {
            return this.$__6;
          },
          set _classMap(value) {
            this.$__6 = value;
          },
          get _classPartialMap() {
            return this.$__7;
          },
          set _classPartialMap(value) {
            this.$__7 = value;
          },
          get _attrValueMap() {
            return this.$__8;
          },
          set _attrValueMap(value) {
            this.$__8 = value;
          },
          get _attrValuePartialMap() {
            return this.$__9;
          },
          set _attrValuePartialMap(value) {
            this.$__9 = value;
          },
          addSelectable: function(cssSelector, selectable) {
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
            var terminalList = MapWrapper.get(map, name);
            if (isBlank(terminalList)) {
              terminalList = ListWrapper.create();
              MapWrapper.set(map, name, terminalList);
            }
            ListWrapper.push(terminalList, selectable);
          },
          _addPartial: function(map, name) {
            var matcher = MapWrapper.get(map, name);
            if (isBlank(matcher)) {
              matcher = new SelectorMatcher();
              MapWrapper.set(map, name, matcher);
            }
            return matcher;
          },
          match: function(cssSelector, matchedCallback) {
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
            if (isBlank(map) || isBlank(name)) {
              return;
            }
            var selectables = MapWrapper.get(map, name);
            if (isBlank(selectables)) {
              return;
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
            if (isBlank(map) || isBlank(name)) {
              return;
            }
            var nestedSelector = MapWrapper.get(map, name);
            if (isBlank(nestedSelector)) {
              return;
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
  function require(path) {
    return $traceurRuntime.require("core/compiler/shadow_dom", path);
  }
  var EmulatedShadowDomStrategy,
      NativeShadowDomStrategy,
      ShadowDomEmulated,
      ShadowDomNative;
  return {
    setters: [function(m) {
      EmulatedShadowDomStrategy = m.EmulatedShadowDomStrategy;
      NativeShadowDomStrategy = m.NativeShadowDomStrategy;
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }],
    execute: function() {
      ShadowDomEmulated = $__export("ShadowDomEmulated", new EmulatedShadowDomStrategy());
      ShadowDomNative = $__export("ShadowDomNative", new NativeShadowDomStrategy());
    }
  };
});




System.register("core/compiler/shadow_dom_strategy", ["facade/lang", "facade/dom", "./view"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/shadow_dom_strategy";
  function require(path) {
    return $traceurRuntime.require("core/compiler/shadow_dom_strategy", path);
  }
  var CONST,
      DOM,
      Element,
      View,
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
      CONST = m.CONST;
    }, function(m) {
      DOM = m.DOM;
      Element = m.Element;
    }, function(m) {
      View = m.View;
    }],
    execute: function() {
      ShadowDomStrategy = $__export("ShadowDomStrategy", (function() {
        var ShadowDomStrategy = function ShadowDomStrategy() {};
        return ($traceurRuntime.createClass)(ShadowDomStrategy, {attachTemplate: function(el, view) {}}, {});
      }()));
      Object.defineProperty(ShadowDomStrategy, "annotations", {get: function() {
          return [new CONST()];
        }});
      Object.defineProperty(ShadowDomStrategy.prototype.attachTemplate, "parameters", {get: function() {
          return [[Element], [View]];
        }});
      EmulatedShadowDomStrategy = $__export("EmulatedShadowDomStrategy", (function($__super) {
        var EmulatedShadowDomStrategy = function EmulatedShadowDomStrategy() {};
        return ($traceurRuntime.createClass)(EmulatedShadowDomStrategy, {attachTemplate: function(el, view) {
            DOM.clearNodes(el);
            moveViewNodesIntoParent(el, view);
          }}, {}, $__super);
      }(ShadowDomStrategy)));
      Object.defineProperty(EmulatedShadowDomStrategy, "annotations", {get: function() {
          return [new CONST()];
        }});
      Object.defineProperty(EmulatedShadowDomStrategy.prototype.attachTemplate, "parameters", {get: function() {
          return [[Element], [View]];
        }});
      NativeShadowDomStrategy = $__export("NativeShadowDomStrategy", (function($__super) {
        var NativeShadowDomStrategy = function NativeShadowDomStrategy() {};
        return ($traceurRuntime.createClass)(NativeShadowDomStrategy, {attachTemplate: function(el, view) {
            moveViewNodesIntoParent(el.createShadowRoot(), view);
          }}, {}, $__super);
      }(ShadowDomStrategy)));
      Object.defineProperty(NativeShadowDomStrategy, "annotations", {get: function() {
          return [new CONST()];
        }});
      Object.defineProperty(NativeShadowDomStrategy.prototype.attachTemplate, "parameters", {get: function() {
          return [[Element], [View]];
        }});
    }
  };
});




System.register("core/compiler/template_loader", ["facade/async"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/template_loader";
  function require(path) {
    return $traceurRuntime.require("core/compiler/template_loader", path);
  }
  var Promise,
      TemplateLoader;
  return {
    setters: [function(m) {
      Promise = m.Promise;
    }],
    execute: function() {
      TemplateLoader = $__export("TemplateLoader", (function() {
        var TemplateLoader = function TemplateLoader() {};
        return ($traceurRuntime.createClass)(TemplateLoader, {load: function(url) {
            return null;
          }}, {});
      }()));
      Object.defineProperty(TemplateLoader.prototype.load, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("core/compiler/view", ["facade/dom", "facade/collection", "change_detection/change_detection", "./element_injector", "./element_binder", "./directive_metadata", "reflection/types", "facade/lang", "di/di", "core/dom/element", "./viewport", "./interfaces"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/view";
  function require(path) {
    return $traceurRuntime.require("core/compiler/view", path);
  }
  var DOM,
      Element,
      Node,
      Text,
      DocumentFragment,
      TemplateElement,
      ListWrapper,
      MapWrapper,
      StringMapWrapper,
      List,
      ProtoRecordRange,
      RecordRange,
      Record,
      ChangeDispatcher,
      AST,
      ContextWithVariableBindings,
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
      ProtoRecordRange = m.ProtoRecordRange;
      RecordRange = m.RecordRange;
      Record = m.Record;
      ChangeDispatcher = m.ChangeDispatcher;
      AST = m.AST;
      ContextWithVariableBindings = m.ContextWithVariableBindings;
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
    }],
    execute: function() {
      NG_BINDING_CLASS = 'ng-binding';
      NG_BINDING_CLASS_SELECTOR = '.ng-binding';
      NO_FORMATTERS = MapWrapper.create();
      View = $__export("View", (function() {
        var View = function View(proto, nodes, protoRecordRange, protoContextLocals) {
          this.proto = proto;
          this.nodes = nodes;
          this.recordRange = protoRecordRange.instantiate(this, NO_FORMATTERS);
          this.elementInjectors = null;
          this.rootElementInjectors = null;
          this.textNodes = null;
          this.bindElements = null;
          this.componentChildViews = null;
          this.viewPorts = null;
          this.preBuiltObjects = null;
          this.context = null;
          if (MapWrapper.size(protoContextLocals) > 0) {
            this.contextWithLocals = new ContextWithVariableBindings(null, MapWrapper.clone(protoContextLocals));
          } else {
            this.contextWithLocals = null;
          }
        };
        return ($traceurRuntime.createClass)(View, {
          get rootElementInjectors() {
            return this.$__0;
          },
          set rootElementInjectors(value) {
            this.$__0 = value;
          },
          get elementInjectors() {
            return this.$__1;
          },
          set elementInjectors(value) {
            this.$__1 = value;
          },
          get bindElements() {
            return this.$__2;
          },
          set bindElements(value) {
            this.$__2 = value;
          },
          get textNodes() {
            return this.$__3;
          },
          set textNodes(value) {
            this.$__3 = value;
          },
          get recordRange() {
            return this.$__4;
          },
          set recordRange(value) {
            this.$__4 = value;
          },
          get nodes() {
            return this.$__5;
          },
          set nodes(value) {
            this.$__5 = value;
          },
          get componentChildViews() {
            return this.$__6;
          },
          set componentChildViews(value) {
            this.$__6 = value;
          },
          get viewPorts() {
            return this.$__7;
          },
          set viewPorts(value) {
            this.$__7 = value;
          },
          get preBuiltObjects() {
            return this.$__8;
          },
          set preBuiltObjects(value) {
            this.$__8 = value;
          },
          get proto() {
            return this.$__9;
          },
          set proto(value) {
            this.$__9 = value;
          },
          get context() {
            return this.$__10;
          },
          set context(value) {
            this.$__10 = value;
          },
          get contextWithLocals() {
            return this.$__11;
          },
          set contextWithLocals(value) {
            this.$__11 = value;
          },
          init: function(elementInjectors, rootElementInjectors, textNodes, bindElements, viewPorts, preBuiltObjects, componentChildViews) {
            this.elementInjectors = elementInjectors;
            this.rootElementInjectors = rootElementInjectors;
            this.textNodes = textNodes;
            this.bindElements = bindElements;
            this.viewPorts = viewPorts;
            this.preBuiltObjects = preBuiltObjects;
            this.componentChildViews = componentChildViews;
          },
          setLocal: function(contextName, value) {
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
            this.recordRange.setContext(this.context);
          },
          _dehydrateContext: function() {
            if (isPresent(this.contextWithLocals)) {
              this.contextWithLocals.clearValues();
            }
            this.context = null;
          },
          hydrate: function(appInjector, hostElementInjector, context) {
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
              if (isPresent(shadowDomAppInjector)) {
                this.componentChildViews[componentChildViewIndex++].hydrate(shadowDomAppInjector, elementInjector, elementInjector.getComponent());
              }
            }
          },
          dehydrate: function() {
            for (var i = 0; i < this.componentChildViews.length; i++) {
              this.componentChildViews[i].dehydrate();
            }
            for (var i = 0; i < this.elementInjectors.length; i++) {
              this.elementInjectors[i].clearDirectives();
            }
            if (isPresent(this.viewPorts)) {
              for (var i = 0; i < this.viewPorts.length; i++) {
                this.viewPorts[i].dehydrate();
              }
            }
            this._dehydrateContext();
          },
          onRecordChange: function(groupMemento, records) {
            this._invokeMementoForRecords(records);
            if (groupMemento instanceof DirectivePropertyGroupMemento) {
              this._notifyDirectiveAboutChanges(groupMemento, records);
            }
          },
          _invokeMementoForRecords: function(records) {
            for (var i = 0; i < records.length; ++i) {
              this._invokeMementoFor(records[i]);
            }
          },
          _notifyDirectiveAboutChanges: function(groupMemento, records) {
            var dir = groupMemento.directive(this.elementInjectors);
            if (dir instanceof OnChange) {
              dir.onChange(this._collectChanges(records));
            }
          },
          _invokeMementoFor: function(record) {
            var memento = record.expressionMemento();
            if (memento instanceof DirectivePropertyMemento) {
              var directiveMemento = memento;
              directiveMemento.invoke(record, this.elementInjectors);
            } else if (memento instanceof ElementPropertyMemento) {
              var elementMemento = memento;
              elementMemento.invoke(record, this.bindElements);
            } else {
              var textNodeIndex = memento;
              DOM.setText(this.textNodes[textNodeIndex], record.currentValue);
            }
          },
          _collectChanges: function(records) {
            var changes = StringMapWrapper.create();
            for (var i = 0; i < records.length; ++i) {
              var record = records[i];
              var propertyUpdate = new PropertyUpdate(record.currentValue, record.previousValue);
              StringMapWrapper.set(changes, record.expressionMemento()._setterName, propertyUpdate);
            }
            return changes;
          }
        }, {});
      }()));
      Object.defineProperty(View, "annotations", {get: function() {
          return [new IMPLEMENTS(ChangeDispatcher)];
        }});
      Object.defineProperty(View, "parameters", {get: function() {
          return [[ProtoView], [List], [ProtoRecordRange], [Map]];
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
      Object.defineProperty(View.prototype._invokeMementoForRecords, "parameters", {get: function() {
          return [[List]];
        }});
      Object.defineProperty(View.prototype._notifyDirectiveAboutChanges, "parameters", {get: function() {
          return [[], [List]];
        }});
      Object.defineProperty(View.prototype._invokeMementoFor, "parameters", {get: function() {
          return [[Record]];
        }});
      Object.defineProperty(View.prototype._collectChanges, "parameters", {get: function() {
          return [[List]];
        }});
      ProtoView = $__export("ProtoView", (function() {
        var ProtoView = function ProtoView(template, protoRecordRange) {
          this.element = template;
          this.elementBinders = [];
          this.variableBindings = MapWrapper.create();
          this.protoContextLocals = MapWrapper.create();
          this.protoRecordRange = protoRecordRange;
          this.textNodesWithBindingCount = 0;
          this.elementsWithBindingCount = 0;
          this.instantiateInPlace = false;
          if (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS)) {
            this.rootBindingOffset = 1;
          } else {
            this.rootBindingOffset = 0;
          }
          this.isTemplateElement = this.element instanceof TemplateElement;
        };
        return ($traceurRuntime.createClass)(ProtoView, {
          get element() {
            return this.$__12;
          },
          set element(value) {
            this.$__12 = value;
          },
          get elementBinders() {
            return this.$__13;
          },
          set elementBinders(value) {
            this.$__13 = value;
          },
          get protoRecordRange() {
            return this.$__14;
          },
          set protoRecordRange(value) {
            this.$__14 = value;
          },
          get variableBindings() {
            return this.$__15;
          },
          set variableBindings(value) {
            this.$__15 = value;
          },
          get protoContextLocals() {
            return this.$__16;
          },
          set protoContextLocals(value) {
            this.$__16 = value;
          },
          get textNodesWithBindingCount() {
            return this.$__17;
          },
          set textNodesWithBindingCount(value) {
            this.$__17 = value;
          },
          get elementsWithBindingCount() {
            return this.$__18;
          },
          set elementsWithBindingCount(value) {
            this.$__18 = value;
          },
          get instantiateInPlace() {
            return this.$__19;
          },
          set instantiateInPlace(value) {
            this.$__19 = value;
          },
          get rootBindingOffset() {
            return this.$__20;
          },
          set rootBindingOffset(value) {
            this.$__20 = value;
          },
          get isTemplateElement() {
            return this.$__21;
          },
          set isTemplateElement(value) {
            this.$__21 = value;
          },
          instantiate: function(hostElementInjector) {
            var rootElementClone = this.instantiateInPlace ? this.element : DOM.clone(this.element);
            var elementsWithBindings;
            if (this.isTemplateElement) {
              elementsWithBindings = DOM.querySelectorAll(rootElementClone.content, NG_BINDING_CLASS_SELECTOR);
            } else {
              elementsWithBindings = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
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
            var view = new View(this, viewNodes, this.protoRecordRange, this.protoContextLocals);
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
              var element;
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
                  elementInjector = protoElementInjector.instantiate(parentElementInjector, null);
                } else {
                  elementInjector = protoElementInjector.instantiate(null, hostElementInjector);
                  ListWrapper.push(rootElementInjectors, elementInjector);
                }
              }
              elementInjectors[i] = elementInjector;
              var viewPort = null;
              if (isPresent(binder.templateDirective)) {
                viewPort = new ViewPort(view, element, binder.nestedProtoView, elementInjector);
                ListWrapper.push(viewPorts, viewPort);
              }
              var preBuiltObject = null;
              if (isPresent(elementInjector)) {
                preBuiltObject = new PreBuiltObjects(view, new NgElement(element), viewPort);
              }
              preBuiltObjects[i] = preBuiltObject;
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
              if (isPresent(binder.componentDirective)) {
                var childView = binder.nestedProtoView.instantiate(elementInjector);
                view.recordRange.addRange(childView.recordRange);
                binder.componentDirective.shadowDomStrategy.attachTemplate(element, childView);
                ListWrapper.push(componentChildViews, childView);
              }
            }
            view.init(elementInjectors, rootElementInjectors, textNodes, elementsWithPropertyBindings, viewPorts, preBuiltObjects, componentChildViews);
            return view;
          },
          bindVariable: function(contextName, templateName) {
            MapWrapper.set(this.variableBindings, contextName, templateName);
            MapWrapper.set(this.protoContextLocals, templateName, null);
          },
          bindElement: function(protoElementInjector) {
            var componentDirective = arguments[1] !== (void 0) ? arguments[1] : null;
            var templateDirective = arguments[2] !== (void 0) ? arguments[2] : null;
            var elBinder = new ElementBinder(protoElementInjector, componentDirective, templateDirective);
            ListWrapper.push(this.elementBinders, elBinder);
            return elBinder;
          },
          bindTextNode: function(indexInParent, expression) {
            var elBinder = this.elementBinders[this.elementBinders.length - 1];
            if (isBlank(elBinder.textNodeIndices)) {
              elBinder.textNodeIndices = ListWrapper.create();
            }
            ListWrapper.push(elBinder.textNodeIndices, indexInParent);
            var memento = this.textNodesWithBindingCount++;
            this.protoRecordRange.addRecordsFromAST(expression, memento, memento);
          },
          bindElementProperty: function(expression, setterName, setter) {
            var elBinder = this.elementBinders[this.elementBinders.length - 1];
            if (!elBinder.hasElementPropertyBindings) {
              elBinder.hasElementPropertyBindings = true;
              this.elementsWithBindingCount++;
            }
            var memento = new ElementPropertyMemento(this.elementsWithBindingCount - 1, setterName, setter);
            this.protoRecordRange.addRecordsFromAST(expression, memento, memento);
          },
          bindEvent: function(eventName, expression) {
            var elBinder = this.elementBinders[this.elementBinders.length - 1];
            if (isBlank(elBinder.events)) {
              elBinder.events = MapWrapper.create();
            }
            MapWrapper.set(elBinder.events, eventName, expression);
          },
          bindDirectiveProperty: function(directiveIndex, expression, setterName, setter, isContentWatch) {
            var expMemento = new DirectivePropertyMemento(this.elementBinders.length - 1, directiveIndex, setterName, setter);
            var groupMemento = DirectivePropertyGroupMemento.get(expMemento);
            this.protoRecordRange.addRecordsFromAST(expression, expMemento, groupMemento, isContentWatch);
          }
        }, {createRootProtoView: function(protoView, insertionElement, rootComponentAnnotatedType) {
            DOM.addClass(insertionElement, 'ng-binding');
            var rootProtoView = new ProtoView(insertionElement, new ProtoRecordRange());
            rootProtoView.instantiateInPlace = true;
            var binder = rootProtoView.bindElement(new ProtoElementInjector(null, 0, [rootComponentAnnotatedType.type], true));
            binder.componentDirective = rootComponentAnnotatedType;
            binder.nestedProtoView = protoView;
            return rootProtoView;
          }});
      }()));
      Object.defineProperty(ProtoView, "parameters", {get: function() {
          return [[Element], [ProtoRecordRange]];
        }});
      Object.defineProperty(ProtoView.prototype.instantiate, "parameters", {get: function() {
          return [[ElementInjector]];
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
          this._elementIndex = elementIndex;
          this._setterName = setterName;
          this._setter = setter;
        };
        return ($traceurRuntime.createClass)(ElementPropertyMemento, {
          get _elementIndex() {
            return this.$__22;
          },
          set _elementIndex(value) {
            this.$__22 = value;
          },
          get _setterName() {
            return this.$__23;
          },
          set _setterName(value) {
            this.$__23 = value;
          },
          get _setter() {
            return this.$__24;
          },
          set _setter(value) {
            this.$__24 = value;
          },
          invoke: function(record, bindElements) {
            var element = bindElements[this._elementIndex];
            this._setter(element, record.currentValue);
          }
        }, {});
      }()));
      Object.defineProperty(ElementPropertyMemento, "parameters", {get: function() {
          return [[int], [$traceurRuntime.type.string], [SetterFn]];
        }});
      Object.defineProperty(ElementPropertyMemento.prototype.invoke, "parameters", {get: function() {
          return [[Record], [List]];
        }});
      DirectivePropertyMemento = $__export("DirectivePropertyMemento", (function() {
        var DirectivePropertyMemento = function DirectivePropertyMemento(elementInjectorIndex, directiveIndex, setterName, setter) {
          this._elementInjectorIndex = elementInjectorIndex;
          this._directiveIndex = directiveIndex;
          this._setterName = setterName;
          this._setter = setter;
        };
        return ($traceurRuntime.createClass)(DirectivePropertyMemento, {
          get _elementInjectorIndex() {
            return this.$__25;
          },
          set _elementInjectorIndex(value) {
            this.$__25 = value;
          },
          get _directiveIndex() {
            return this.$__26;
          },
          set _directiveIndex(value) {
            this.$__26 = value;
          },
          get _setterName() {
            return this.$__27;
          },
          set _setterName(value) {
            this.$__27 = value;
          },
          get _setter() {
            return this.$__28;
          },
          set _setter(value) {
            this.$__28 = value;
          },
          invoke: function(record, elementInjectors) {
            var elementInjector = elementInjectors[this._elementInjectorIndex];
            var directive = elementInjector.getAtIndex(this._directiveIndex);
            this._setter(directive, record.currentValue);
          }
        }, {});
      }()));
      Object.defineProperty(DirectivePropertyMemento, "parameters", {get: function() {
          return [[$traceurRuntime.type.number], [$traceurRuntime.type.number], [$traceurRuntime.type.string], [SetterFn]];
        }});
      Object.defineProperty(DirectivePropertyMemento.prototype.invoke, "parameters", {get: function() {
          return [[Record], [List]];
        }});
      _groups = MapWrapper.create();
      DirectivePropertyGroupMemento = (function() {
        var DirectivePropertyGroupMemento = function DirectivePropertyGroupMemento(elementInjectorIndex, directiveIndex) {
          this._elementInjectorIndex = elementInjectorIndex;
          this._directiveIndex = directiveIndex;
        };
        return ($traceurRuntime.createClass)(DirectivePropertyGroupMemento, {
          get _elementInjectorIndex() {
            return this.$__29;
          },
          set _elementInjectorIndex(value) {
            this.$__29 = value;
          },
          get _directiveIndex() {
            return this.$__30;
          },
          set _directiveIndex(value) {
            this.$__30 = value;
          },
          directive: function(elementInjectors) {
            var elementInjector = elementInjectors[this._elementInjectorIndex];
            return elementInjector.getAtIndex(this._directiveIndex);
          }
        }, {get: function(memento) {
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
        return ($traceurRuntime.createClass)(PropertyUpdate, {
          get currentValue() {
            return this.$__31;
          },
          set currentValue(value) {
            this.$__31 = value;
          },
          get previousValue() {
            return this.$__32;
          },
          set previousValue(value) {
            this.$__32 = value;
          }
        }, {});
      }());
    }
  };
});




System.register("core/compiler/viewport", ["./view", "facade/dom", "facade/collection", "facade/lang", "di/di", "core/compiler/element_injector"], function($__export) {
  "use strict";
  var __moduleName = "core/compiler/viewport";
  function require(path) {
    return $traceurRuntime.require("core/compiler/viewport", path);
  }
  var View,
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
          this.parentView = parentView;
          this.templateElement = templateElement;
          this.defaultProtoView = defaultProtoView;
          this.elementInjector = elementInjector;
          this._views = [];
          this.appInjector = null;
          this.hostElementInjector = null;
        };
        return ($traceurRuntime.createClass)(ViewPort, {
          get parentView() {
            return this.$__0;
          },
          set parentView(value) {
            this.$__0 = value;
          },
          get templateElement() {
            return this.$__1;
          },
          set templateElement(value) {
            this.$__1 = value;
          },
          get defaultProtoView() {
            return this.$__2;
          },
          set defaultProtoView(value) {
            this.$__2 = value;
          },
          get _views() {
            return this.$__3;
          },
          set _views(value) {
            this.$__3 = value;
          },
          get _viewLastNode() {
            return this.$__4;
          },
          set _viewLastNode(value) {
            this.$__4 = value;
          },
          get elementInjector() {
            return this.$__5;
          },
          set elementInjector(value) {
            this.$__5 = value;
          },
          get appInjector() {
            return this.$__6;
          },
          set appInjector(value) {
            this.$__6 = value;
          },
          get hostElementInjector() {
            return this.$__7;
          },
          set hostElementInjector(value) {
            this.$__7 = value;
          },
          hydrate: function(appInjector, hostElementInjector) {
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
            return this._views[index];
          },
          get length() {
            return this._views.length;
          },
          _siblingToInsertAfter: function(index) {
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
            return this.insert(newView, atIndex);
          },
          insert: function(view) {
            var atIndex = arguments[1] !== (void 0) ? arguments[1] : -1;
            if (atIndex == -1)
              atIndex = this._views.length;
            ListWrapper.insert(this._views, atIndex, view);
            ViewPort.moveViewNodesAfterSibling(this._siblingToInsertAfter(atIndex), view);
            this.parentView.recordRange.addRange(view.recordRange);
            this._linkElementInjectors(view);
            return view;
          },
          remove: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (atIndex == -1)
              atIndex = this._views.length - 1;
            var removedView = this.get(atIndex);
            ListWrapper.removeAt(this._views, atIndex);
            ViewPort.removeViewNodesFromParent(this.templateElement.parentNode, removedView);
            removedView.recordRange.remove();
            this._unlinkElementInjectors(removedView);
            return removedView;
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
          return [[View], [Element], [ProtoView], [ElementInjector]];
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




System.register("core/life_cycle/life_cycle", ["facade/lang", "change_detection/change_detection", "core/zone/vm_turn_zone", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "core/life_cycle/life_cycle";
  function require(path) {
    return $traceurRuntime.require("core/life_cycle/life_cycle", path);
  }
  var FIELD,
      print,
      ChangeDetector,
      VmTurnZone,
      ListWrapper,
      LifeCycle;
  return {
    setters: [function(m) {
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
          this._changeDetector = changeDetector;
        };
        return ($traceurRuntime.createClass)(LifeCycle, {
          get _changeDetector() {
            return this.$__0;
          },
          set _changeDetector(value) {
            this.$__0 = value;
          },
          registerWith: function(zone) {
            var $__1 = this;
            var errorHandler = (function(exception, stackTrace) {
              var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
              print((exception + "\n\n" + longStackTrace));
              throw exception;
            });
            zone.initCallbacks({
              onErrorHandler: errorHandler,
              onTurnDone: (function() {
                return $__1.tick();
              })
            });
          },
          tick: function() {
            this._changeDetector.detectChanges();
          }
        }, {});
      }()));
      Object.defineProperty(LifeCycle, "parameters", {get: function() {
          return [[ChangeDetector]];
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
  function require(path) {
    return $traceurRuntime.require("core/zone/vm_turn_zone", path);
  }
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
        var VmTurnZone = function VmTurnZone($__8) {
          var enableLongStackTrace = $__8.enableLongStackTrace;
          this._nestedRunCounter = 0;
          this._onTurnStart = null;
          this._onTurnDone = null;
          this._onErrorHandler = null;
          this._outerZone = window.zone;
          this._innerZone = this._createInnerZone(this._outerZone, enableLongStackTrace);
        };
        return ($traceurRuntime.createClass)(VmTurnZone, {
          get _outerZone() {
            return this.$__0;
          },
          set _outerZone(value) {
            this.$__0 = value;
          },
          get _innerZone() {
            return this.$__1;
          },
          set _innerZone(value) {
            this.$__1 = value;
          },
          get _onTurnStart() {
            return this.$__2;
          },
          set _onTurnStart(value) {
            this.$__2 = value;
          },
          get _onTurnDone() {
            return this.$__3;
          },
          set _onTurnDone(value) {
            this.$__3 = value;
          },
          get _onErrorHandler() {
            return this.$__4;
          },
          set _onErrorHandler(value) {
            this.$__4 = value;
          },
          get _nestedRunCounter() {
            return this.$__5;
          },
          set _nestedRunCounter(value) {
            this.$__5 = value;
          },
          initCallbacks: function() {
            var $__8 = arguments[0] !== (void 0) ? arguments[0] : {},
                onTurnStart = $__8.onTurnStart,
                onTurnDone = $__8.onTurnDone,
                onScheduleMicrotask = $__8.onScheduleMicrotask,
                onErrorHandler = $__8.onErrorHandler;
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
            var $__6 = this;
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
                $__6._beforeTask();
              }),
              afterTask: (function() {
                $__6._afterTask();
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
  function require(path) {
    return $traceurRuntime.require("di/annotations", path);
  }
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
        return ($traceurRuntime.createClass)(Inject, {
          get token() {
            return this.$__0;
          },
          set token(value) {
            this.$__0 = value;
          }
        }, {});
      }()));
      Object.defineProperty(Inject, "annotations", {get: function() {
          return [new CONST()];
        }});
      InjectPromise = $__export("InjectPromise", (function() {
        var InjectPromise = function InjectPromise(token) {
          this.token = token;
        };
        return ($traceurRuntime.createClass)(InjectPromise, {
          get token() {
            return this.$__1;
          },
          set token(value) {
            this.$__1 = value;
          }
        }, {});
      }()));
      Object.defineProperty(InjectPromise, "annotations", {get: function() {
          return [new CONST()];
        }});
      InjectLazy = $__export("InjectLazy", (function() {
        var InjectLazy = function InjectLazy(token) {
          this.token = token;
        };
        return ($traceurRuntime.createClass)(InjectLazy, {
          get token() {
            return this.$__2;
          },
          set token(value) {
            this.$__2 = value;
          }
        }, {});
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




System.register("di/binding", ["facade/lang", "facade/collection", "reflection/reflection", "./key", "./annotations", "./exceptions"], function($__export) {
  "use strict";
  var __moduleName = "di/binding";
  function require(path) {
    return $traceurRuntime.require("di/binding", path);
  }
  var FIELD,
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
    return new BindingBuilder(token);
  }
  function _dependenciesFor(typeOrFunc) {
    var params = reflector.parameters(typeOrFunc);
    if (isBlank(params))
      return [];
    if (ListWrapper.any(params, (function(p) {
      return isBlank(p);
    })))
      throw new NoAnnotationError(typeOrFunc);
    return ListWrapper.map(params, (function(p) {
      return _extractToken(typeOrFunc, p);
    }));
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
    return new Dependency(Key.get(token), asPromise, lazy, depProps);
  }
  $__export("bind", bind);
  return {
    setters: [function(m) {
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
          this.key = key;
          this.asPromise = asPromise;
          this.lazy = lazy;
          this.properties = properties;
        };
        return ($traceurRuntime.createClass)(Dependency, {
          get key() {
            return this.$__0;
          },
          set key(value) {
            this.$__0 = value;
          },
          get asPromise() {
            return this.$__1;
          },
          set asPromise(value) {
            this.$__1 = value;
          },
          get lazy() {
            return this.$__2;
          },
          set lazy(value) {
            this.$__2 = value;
          },
          get properties() {
            return this.$__3;
          },
          set properties(value) {
            this.$__3 = value;
          }
        }, {});
      }()));
      Object.defineProperty(Dependency, "parameters", {get: function() {
          return [[Key], [$traceurRuntime.type.boolean], [$traceurRuntime.type.boolean], [List]];
        }});
      Binding = $__export("Binding", (function() {
        var Binding = function Binding(key, factory, dependencies, providedAsPromise) {
          this.key = key;
          this.factory = factory;
          this.dependencies = dependencies;
          this.providedAsPromise = providedAsPromise;
        };
        return ($traceurRuntime.createClass)(Binding, {
          get key() {
            return this.$__4;
          },
          set key(value) {
            this.$__4 = value;
          },
          get factory() {
            return this.$__5;
          },
          set factory(value) {
            this.$__5 = value;
          },
          get dependencies() {
            return this.$__6;
          },
          set dependencies(value) {
            this.$__6 = value;
          },
          get providedAsPromise() {
            return this.$__7;
          },
          set providedAsPromise(value) {
            this.$__7 = value;
          }
        }, {});
      }()));
      Object.defineProperty(Binding, "parameters", {get: function() {
          return [[Key], [Function], [List], [$traceurRuntime.type.boolean]];
        }});
      BindingBuilder = $__export("BindingBuilder", (function() {
        var BindingBuilder = function BindingBuilder(token) {
          this.token = token;
        };
        return ($traceurRuntime.createClass)(BindingBuilder, {
          get token() {
            return this.$__8;
          },
          set token(value) {
            this.$__8 = value;
          },
          toClass: function(type) {
            return new Binding(Key.get(this.token), reflector.factory(type), _dependenciesFor(type), false);
          },
          toValue: function(value) {
            return new Binding(Key.get(this.token), (function() {
              return value;
            }), [], false);
          },
          toFactory: function(factoryFunction) {
            var dependencies = arguments[1] !== (void 0) ? arguments[1] : null;
            return new Binding(Key.get(this.token), factoryFunction, this._constructDependencies(factoryFunction, dependencies), false);
          },
          toAsyncFactory: function(factoryFunction) {
            var dependencies = arguments[1] !== (void 0) ? arguments[1] : null;
            return new Binding(Key.get(this.token), factoryFunction, this._constructDependencies(factoryFunction, dependencies), true);
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
  function require(path) {
    return $traceurRuntime.require("di/di", path);
  }
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




System.register("di/exceptions", ["facade/collection", "facade/lang", "./key"], function($__export) {
  "use strict";
  var __moduleName = "di/exceptions";
  function require(path) {
    return $traceurRuntime.require("di/exceptions", path);
  }
  var ListWrapper,
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
          this.keys = [key];
          this.constructResolvingMessage = constructResolvingMessage;
          this.message = this.constructResolvingMessage(this.keys);
        };
        return ($traceurRuntime.createClass)(ProviderError, {
          get keys() {
            return this.$__0;
          },
          set keys(value) {
            this.$__0 = value;
          },
          get constructResolvingMessage() {
            return this.$__1;
          },
          set constructResolvingMessage(value) {
            this.$__1 = value;
          },
          get message() {
            return this.$__2;
          },
          set message(value) {
            this.$__2 = value;
          },
          addKey: function(key) {
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
          $traceurRuntime.superConstructor(NoProviderError).call(this, key, function(keys) {
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
          $traceurRuntime.superConstructor(AsyncBindingError).call(this, key, function(keys) {
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
          $traceurRuntime.superConstructor(CyclicDependencyError).call(this, key, function(keys) {
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
          $traceurRuntime.superConstructor(InstantiationError).call(this, key, function(keys) {
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
        return ($traceurRuntime.createClass)(InvalidBindingError, {
          get message() {
            return this.$__3;
          },
          set message(value) {
            this.$__3 = value;
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(Error)));
      NoAnnotationError = $__export("NoAnnotationError", (function($__super) {
        var NoAnnotationError = function NoAnnotationError(typeOrFunc) {
          this.message = ("Cannot resolve all parameters for " + stringify(typeOrFunc));
        };
        return ($traceurRuntime.createClass)(NoAnnotationError, {
          get message() {
            return this.$__4;
          },
          set message(value) {
            this.$__4 = value;
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(Error)));
    }
  };
});




System.register("di/injector", ["facade/collection", "./binding", "./exceptions", "facade/lang", "facade/async", "./key"], function($__export) {
  "use strict";
  var __moduleName = "di/injector";
  function require(path) {
    return $traceurRuntime.require("di/injector", path);
  }
  var Map,
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
    return obj instanceof _Waiting;
  }
  function _flattenBindings(bindings, res) {
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
          this.promise = promise;
        };
        return ($traceurRuntime.createClass)(_Waiting, {
          get promise() {
            return this.$__0;
          },
          set promise(value) {
            this.$__0 = value;
          }
        }, {});
      }());
      Object.defineProperty(_Waiting, "parameters", {get: function() {
          return [[Promise]];
        }});
      Injector = $__export("Injector", (function() {
        var Injector = function Injector(bindings) {
          var $__12,
              $__13;
          var $__11 = arguments[1] !== (void 0) ? arguments[1] : {},
              parent = ($__12 = $__11.parent) === void 0 ? null : $__12,
              defaultBindings = ($__13 = $__11.defaultBindings) === void 0 ? false : $__13;
          var flatten = _flattenBindings(bindings, MapWrapper.create());
          this._bindings = this._createListOfBindings(flatten);
          this._instances = this._createInstances();
          this._parent = parent;
          this._defaultBindings = defaultBindings;
          this._asyncStrategy = new _AsyncInjectorStrategy(this);
          this._syncStrategy = new _SyncInjectorStrategy(this);
        };
        return ($traceurRuntime.createClass)(Injector, {
          get _bindings() {
            return this.$__1;
          },
          set _bindings(value) {
            this.$__1 = value;
          },
          get _instances() {
            return this.$__2;
          },
          set _instances(value) {
            this.$__2 = value;
          },
          get _parent() {
            return this.$__3;
          },
          set _parent(value) {
            this.$__3 = value;
          },
          get _defaultBindings() {
            return this.$__4;
          },
          set _defaultBindings(value) {
            this.$__4 = value;
          },
          get _asyncStrategy() {
            return this.$__5;
          },
          set _asyncStrategy(value) {
            this.$__5 = value;
          },
          get _syncStrategy() {
            return this.$__6;
          },
          set _syncStrategy(value) {
            this.$__6 = value;
          },
          get: function(token) {
            return this._getByKey(Key.get(token), false, false);
          },
          asyncGet: function(token) {
            return this._getByKey(Key.get(token), true, false);
          },
          createChild: function(bindings) {
            return new Injector(bindings, {parent: this});
          },
          _createListOfBindings: function(flattenBindings) {
            var bindings = ListWrapper.createFixedSize(Key.numberOfKeys + 1);
            MapWrapper.forEach(flattenBindings, (function(v, keyId) {
              return bindings[keyId] = v;
            }));
            return bindings;
          },
          _createInstances: function() {
            return ListWrapper.createFixedSize(Key.numberOfKeys + 1);
          },
          _getByKey: function(key, returnPromise, returnLazy) {
            var $__9 = this;
            if (returnLazy) {
              return (function() {
                return $__9._getByKey(key, returnPromise, false);
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
            var $__9 = this;
            try {
              var getDependency = (function(d) {
                return $__9._getByKey(d.key, forceAsync || d.asPromise, d.lazy);
              });
              return ListWrapper.map(binding.dependencies, getDependency);
            } catch (e) {
              this._clear(key);
              if (e instanceof ProviderError)
                e.addKey(key);
              throw e;
            }
          },
          _getInstance: function(key) {
            if (this._instances.length <= key.id)
              return null;
            return ListWrapper.get(this._instances, key.id);
          },
          _setInstance: function(key, obj) {
            ListWrapper.set(this._instances, key.id, obj);
          },
          _getBinding: function(key) {
            var binding = this._bindings.length <= key.id ? null : ListWrapper.get(this._bindings, key.id);
            if (isBlank(binding) && this._defaultBindings) {
              return bind(key.token).toClass(key.token);
            } else {
              return binding;
            }
          },
          _markAsConstructing: function(key) {
            this._setInstance(key, _constructing);
          },
          _clear: function(key) {
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
          this.injector = injector;
        };
        return ($traceurRuntime.createClass)(_SyncInjectorStrategy, {
          get injector() {
            return this.$__7;
          },
          set injector(value) {
            this.$__7 = value;
          },
          readFromCache: function(key) {
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
          this.injector = injector;
        };
        return ($traceurRuntime.createClass)(_AsyncInjectorStrategy, {
          get injector() {
            return this.$__8;
          },
          set injector(value) {
            this.$__8 = value;
          },
          readFromCache: function(key) {
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
            var $__9 = this;
            var binding = this.injector._getBinding(key);
            if (isBlank(binding))
              return null;
            this.injector._markAsConstructing(key);
            var deps = this.injector._resolveDependencies(key, binding, true);
            var depsPromise = PromiseWrapper.all(deps);
            var promise = PromiseWrapper.then(depsPromise, null, (function(e) {
              return $__9._errorHandler(key, e);
            })).then((function(deps) {
              return $__9._findOrCreate(key, binding, deps);
            })).then((function(instance) {
              return $__9._cacheInstance(key, instance);
            }));
            this.injector._setInstance(key, new _Waiting(promise));
            return promise;
          },
          _errorHandler: function(key, e) {
            if (e instanceof ProviderError)
              e.addKey(key);
            return PromiseWrapper.reject(e);
          },
          _findOrCreate: function(key, binding, deps) {
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




System.register("di/key", ["./exceptions", "facade/collection", "facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "di/key";
  function require(path) {
    return $traceurRuntime.require("di/key", path);
  }
  var KeyMetadataError,
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
          this.token = token;
          this.id = id;
          this.metadata = null;
        };
        return ($traceurRuntime.createClass)(Key, {
          get token() {
            return this.$__0;
          },
          set token(value) {
            this.$__0 = value;
          },
          get id() {
            return this.$__1;
          },
          set id(value) {
            this.$__1 = value;
          },
          get metadata() {
            return this.$__2;
          },
          set metadata(value) {
            this.$__2 = value;
          }
        }, {
          setMetadata: function(key, metadata) {
            if (isPresent(key.metadata) && key.metadata !== metadata) {
              throw new KeyMetadataError();
            }
            key.metadata = metadata;
            return key;
          },
          get: function(token) {
            return _globalKeyRegistry.get(token);
          },
          get numberOfKeys() {
            return _globalKeyRegistry.numberOfKeys;
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
          get _allKeys() {
            return this.$__3;
          },
          set _allKeys(value) {
            this.$__3 = value;
          },
          get: function(token) {
            if (token instanceof Key)
              return token;
            if (MapWrapper.contains(this._allKeys, token)) {
              return MapWrapper.get(this._allKeys, token);
            }
            var newKey = new Key(token, Key.numberOfKeys);
            MapWrapper.set(this._allKeys, token, newKey);
            return newKey;
          },
          get numberOfKeys() {
            return MapWrapper.size(this._allKeys);
          }
        }, {});
      }()));
      _globalKeyRegistry = new KeyRegistry();
    }
  };
});




System.register("di/module", [], function($__export) {
  "use strict";
  var __moduleName = "di/module";
  function require(path) {
    return $traceurRuntime.require("di/module", path);
  }
  var Module;
  return {
    setters: [],
    execute: function() {
      Module = $__export("Module", (function() {
        var Module = function Module() {};
        return ($traceurRuntime.createClass)(Module, {}, {});
      }()));
    }
  };
});




System.register("di/opaque_token", [], function($__export) {
  "use strict";
  var __moduleName = "di/opaque_token";
  function require(path) {
    return $traceurRuntime.require("di/opaque_token", path);
  }
  var OpaqueToken;
  return {
    setters: [],
    execute: function() {
      OpaqueToken = $__export("OpaqueToken", (function() {
        var OpaqueToken = function OpaqueToken(desc) {
          this._desc = ("Token(" + desc + ")");
        };
        return ($traceurRuntime.createClass)(OpaqueToken, {
          get _desc() {
            return this.$__0;
          },
          set _desc(value) {
            this.$__0 = value;
          },
          toString: function() {
            return this._desc;
          }
        }, {});
      }()));
      Object.defineProperty(OpaqueToken, "parameters", {get: function() {
          return [[$traceurRuntime.type.string]];
        }});
    }
  };
});




System.register("directives/ng_repeat", ["test_lib/test_lib", "core/annotations/annotations", "core/compiler/interfaces", "core/compiler/viewport", "core/compiler/view", "facade/lang", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "directives/ng_repeat";
  function require(path) {
    return $traceurRuntime.require("directives/ng_repeat", path);
  }
  var describe,
      xit,
      it,
      expect,
      beforeEach,
      ddescribe,
      iit,
      Decorator,
      Component,
      Template,
      OnChange,
      ViewPort,
      View,
      isPresent,
      isBlank,
      ListWrapper,
      List,
      NgRepeat,
      RecordViewTuple;
  return {
    setters: [function(m) {
      describe = m.describe;
      xit = m.xit;
      it = m.it;
      expect = m.expect;
      beforeEach = m.beforeEach;
      ddescribe = m.ddescribe;
      iit = m.iit;
    }, function(m) {
      Decorator = m.Decorator;
      Component = m.Component;
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
      List = m.List;
    }],
    execute: function() {
      NgRepeat = $__export("NgRepeat", (function($__super) {
        var NgRepeat = function NgRepeat(viewPort) {
          this.viewPort = viewPort;
        };
        return ($traceurRuntime.createClass)(NgRepeat, {
          get viewPort() {
            return this.$__0;
          },
          set viewPort(value) {
            this.$__0 = value;
          },
          get iterable() {
            return this.$__1;
          },
          set iterable(value) {
            this.$__1 = value;
          },
          onChange: function(changes) {
            var iteratorChanges = changes['iterable'];
            if (isBlank(iteratorChanges) || isBlank(iteratorChanges.currentValue)) {
              this.viewPort.clear();
              return;
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
              var view = viewPort.remove(tuple.record.previousIndex);
              if (isPresent(tuple.record.currentIndex)) {
                tuple.view = view;
                ListWrapper.push(movedTuples, tuple);
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
        return ($traceurRuntime.createClass)(RecordViewTuple, {
          get view() {
            return this.$__2;
          },
          set view(value) {
            this.$__2 = value;
          },
          get record() {
            return this.$__3;
          },
          set record(value) {
            this.$__3 = value;
          }
        }, {});
      }());
    }
  };
});




System.register("facade/async", ["facade/lang", "facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "facade/async";
  function require(path) {
    return $traceurRuntime.require("facade/async", path);
  }
  var int,
      List,
      Promise,
      PromiseWrapper;
  return {
    setters: [function(m) {
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
            return Promise.resolve(obj);
          },
          reject: function(obj) {
            return Promise.reject(obj);
          },
          all: function(promises) {
            if (promises.length == 0)
              return Promise.resolve([]);
            return Promise.all(promises);
          },
          then: function(promise, success, rejection) {
            return promise.then(success, rejection);
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




System.register("facade/collection", ["facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "facade/collection";
  function require(path) {
    return $traceurRuntime.require("facade/collection", path);
  }
  var int,
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
      return false;
    return ListWrapper.isList(obj) || (!(obj instanceof Map) && Symbol.iterator in obj);
  }
  function iterateListLike(obj, fn) {
    for (var $__1 = obj[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__2; !($__2 = $__1.next()).done; ) {
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
            return new Map();
          },
          clone: function(m) {
            return new Map(m);
          },
          createFromStringMap: function(stringMap) {
            var result = MapWrapper.create();
            for (var prop in stringMap) {
              MapWrapper.set(result, prop, stringMap[prop]);
            }
            return result;
          },
          createFromPairs: function(pairs) {
            return new Map(pairs);
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
            return {};
          },
          get: function(map, key) {
            return map.hasOwnProperty(key) ? map[key] : undefined;
          },
          set: function(map, key, value) {
            map[key] = value;
          },
          isEmpty: function(map) {
            for (var prop in map) {
              return false;
            }
            return true;
          },
          forEach: function(map, callback) {
            for (var prop in map) {
              if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
              }
            }
          },
          merge: function(m1, m2) {
            var m = {};
            for (var attr in m1) {
              if (m1.hasOwnProperty(attr)) {
                m[attr] = m1[attr];
              }
            }
            for (var attr in m2) {
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
            return new List();
          },
          createFixedSize: function(size) {
            return new List(size);
          },
          get: function(m, k) {
            return m[k];
          },
          set: function(m, k, v) {
            m[k] = v;
          },
          clone: function(array) {
            return array.slice(0);
          },
          map: function(array, fn) {
            return array.map(fn);
          },
          forEach: function(array, fn) {
            for (var $__1 = array[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__2; !($__2 = $__1.next()).done; ) {
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
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return list[i];
            }
            return null;
          },
          reduce: function(list, fn, init) {
            return list.reduce(fn, init);
          },
          filter: function(array, pred) {
            return array.filter(pred);
          },
          any: function(list, pred) {
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return true;
            }
            return false;
          },
          contains: function(list, el) {
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
            list.splice(index, 0, value);
          },
          removeAt: function(list, index) {
            var res = list[index];
            list.splice(index, 1);
            return res;
          },
          clear: function(list) {
            list.splice(0, list.length);
          },
          join: function(list, s) {
            return list.join(s);
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
      Object.defineProperty(iterateListLike, "parameters", {get: function() {
          return [[], [Function]];
        }});
      SetWrapper = $__export("SetWrapper", (function() {
        var SetWrapper = function SetWrapper() {};
        return ($traceurRuntime.createClass)(SetWrapper, {}, {
          createFromList: function(lst) {
            return new Set(lst);
          },
          has: function(s, key) {
            return s.has(key);
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




System.register("facade/dom", ["facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "facade/dom";
  function require(path) {
    return $traceurRuntime.require("facade/dom", path);
  }
  var DocumentFragment,
      Node,
      NodeList,
      Text,
      Element,
      TemplateElement,
      document,
      location,
      List,
      MapWrapper,
      DOM;
  return {
    setters: [function(m) {
      List = m.List;
      MapWrapper = m.MapWrapper;
    }],
    execute: function() {
      DocumentFragment = $__export("DocumentFragment", window.DocumentFragment);
      Node = $__export("Node", window.Node);
      NodeList = $__export("NodeList", window.NodeList);
      Text = $__export("Text", window.Text);
      Element = $__export("Element", window.HTMLElement);
      TemplateElement = $__export("TemplateElement", window.HTMLTemplateElement);
      document = $__export("document", window.document);
      location = $__export("location", window.location);
      DOM = $__export("DOM", (function() {
        var DOM = function DOM() {};
        return ($traceurRuntime.createClass)(DOM, {}, {
          query: function(selector) {
            return document.querySelector(selector);
          },
          querySelector: function(el, selector) {
            return el.querySelector(selector);
          },
          querySelectorAll: function(el, selector) {
            return el.querySelectorAll(selector);
          },
          on: function(el, evt, listener) {
            el.addEventListener(evt, listener, false);
          },
          getInnerHTML: function(el) {
            return el.innerHTML;
          },
          getOuterHTML: function(el) {
            return el.outerHTML;
          },
          firstChild: function(el) {
            return el.firstChild;
          },
          nextSibling: function(el) {
            return el.nextSibling;
          },
          parentElement: function(el) {
            return el.parentElement;
          },
          childNodes: function(el) {
            return el.childNodes;
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
          insertAfter: function(el, node) {
            el.parentNode.insertBefore(node, el.nextSibling);
          },
          setInnerHTML: function(el, value) {
            el.innerHTML = value;
          },
          getText: function(el) {
            return el.textContent;
          },
          setText: function(text, value) {
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
          clone: function(node) {
            return node.cloneNode(true);
          },
          hasProperty: function(element, name) {
            return name in element;
          },
          getElementsByClassName: function(element, name) {
            return element.getElementsByClassName(name);
          },
          getElementsByTagName: function(element, name) {
            return element.getElementsByTagName(name);
          },
          classList: function(element) {
            return Array.prototype.slice.call(element.classList, 0);
          },
          addClass: function(element, classname) {
            element.classList.add(classname);
          },
          hasClass: function(element, classname) {
            return element.classList.contains(classname);
          },
          attributeMap: function(element) {
            var res = MapWrapper.create();
            var elAttrs = element.attributes;
            for (var i = 0; i < elAttrs.length; i++) {
              var attrib = elAttrs[i];
              MapWrapper.set(res, attrib.name, attrib.value);
            }
            return res;
          },
          templateAwareRoot: function(el) {
            return el instanceof TemplateElement ? el.content : el;
          },
          createHtmlDocument: function() {
            return document.implementation.createHTMLDocument();
          },
          defaultDoc: function() {
            return document;
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
      Object.defineProperty(DOM.attributeMap, "parameters", {get: function() {
          return [[Element]];
        }});
      Object.defineProperty(DOM.templateAwareRoot, "parameters", {get: function() {
          return [[Element]];
        }});
    }
  };
});




System.register("facade/lang", ["rtts_assert/rtts_assert"], function($__export) {
  "use strict";
  var __moduleName = "facade/lang";
  function require(path) {
    return $traceurRuntime.require("facade/lang", path);
  }
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
    return obj !== undefined && obj !== null;
  }
  function isBlank(obj) {
    return obj === undefined || obj === null;
  }
  function toBool(obj) {
    return !!obj;
  }
  function stringify(token) {
    if (typeof token === 'string') {
      return token;
    }
    if (token === undefined || token === null) {
      return '' + token;
    }
    if (token.name) {
      return token.name;
    }
    return token.toString();
  }
  function int() {}
  function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
  }
  function getMapKey(value) {
    return value;
  }
  function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
  }
  function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
  }
  function assertionsEnabled() {
    try {
      var x = "string";
      return false;
    } catch (e) {
      return true;
    }
  }
  function print(obj) {
    console.log(obj);
  }
  $__export("isPresent", isPresent);
  $__export("isBlank", isBlank);
  $__export("toBool", toBool);
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
            return String.fromCharCode(code);
          },
          charCodeAt: function(s, index) {
            return s.charCodeAt(index);
          },
          split: function(s, regExp) {
            return s.split(regExp.multiple);
          },
          equals: function(s, s2) {
            return s === s2;
          },
          replaceAll: function(s, from, replace) {
            return s.replace(from.multiple, replace);
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
            this.parts.push(part);
          },
          toString: function() {
            return this.parts.join("");
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
            var result = parseInt(text);
            if (isNaN(result)) {
              throw new NumberParseError("Invalid integer literal when parsing " + text);
            }
            return result;
          },
          parseInt: function(text, radix) {
            if (radix == 10) {
              if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
              }
            } else if (radix == 16) {
              if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
              }
            } else {
              var result = parseInt(text, radix);
              if (!isNaN(result)) {
                return result;
              }
            }
            throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " + radix);
          },
          parseFloat: function(text) {
            return parseFloat(text);
          },
          isNaN: function(value) {
            return isNaN(value);
          },
          get NaN() {
            return NaN;
          },
          isInteger: function(value) {
            return Number.isInteger(value);
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
            return {
              multiple: new window.RegExp(regExpStr, 'g'),
              single: new window.RegExp(regExpStr)
            };
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
  function require(path) {
    return $traceurRuntime.require("facade/math", path);
  }
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
  function require(path) {
    return $traceurRuntime.require("reflection/reflection", path);
  }
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




System.register("reflection/reflection_capabilities", ["facade/lang", "facade/collection", "./types"], function($__export) {
  "use strict";
  var __moduleName = "reflection/reflection_capabilities";
  function require(path) {
    return $traceurRuntime.require("reflection/reflection_capabilities", path);
  }
  var Type,
      isPresent,
      List,
      ListWrapper,
      GetterFn,
      SetterFn,
      MethodFn,
      ReflectionCapabilities;
  return {
    setters: [function(m) {
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
            switch (type.length) {
              case 0:
                return function() {
                  return new type();
                };
              case 1:
                return function(a1) {
                  return new type(a1);
                };
              case 2:
                return function(a1, a2) {
                  return new type(a1, a2);
                };
              case 3:
                return function(a1, a2, a3) {
                  return new type(a1, a2, a3);
                };
              case 4:
                return function(a1, a2, a3, a4) {
                  return new type(a1, a2, a3, a4);
                };
              case 5:
                return function(a1, a2, a3, a4, a5) {
                  return new type(a1, a2, a3, a4, a5);
                };
              case 6:
                return function(a1, a2, a3, a4, a5, a6) {
                  return new type(a1, a2, a3, a4, a5, a6);
                };
              case 7:
                return function(a1, a2, a3, a4, a5, a6, a7) {
                  return new type(a1, a2, a3, a4, a5, a6, a7);
                };
              case 8:
                return function(a1, a2, a3, a4, a5, a6, a7, a8) {
                  return new type(a1, a2, a3, a4, a5, a6, a7, a8);
                };
              case 9:
                return function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                  return new type(a1, a2, a3, a4, a5, a6, a7, a8, a9);
                };
              case 10:
                return function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                  return new type(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
                };
            }
            ;
            throw new Error("Factory cannot take more than 10 arguments");
          },
          parameters: function(typeOfFunc) {
            return isPresent(typeOfFunc.parameters) ? typeOfFunc.parameters : ListWrapper.createFixedSize(typeOfFunc.length);
          },
          annotations: function(typeOfFunc) {
            return isPresent(typeOfFunc.annotations) ? typeOfFunc.annotations : [];
          },
          getter: function(name) {
            return new Function('o', 'return o.' + name + ';');
          },
          setter: function(name) {
            return new Function('o', 'v', 'return o.' + name + ' = v;');
          },
          method: function(name) {
            var method = ("o." + name);
            return new Function('o', 'args', ("if (!" + method + ") throw new Error('\"" + name + "\" is undefined');") + ("return " + method + ".apply(o, args);"));
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




System.register("reflection/reflector", ["facade/lang", "facade/collection", "./types"], function($__export) {
  "use strict";
  var __moduleName = "reflection/reflector";
  function require(path) {
    return $traceurRuntime.require("reflection/reflector", path);
  }
  var Type,
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
          get _typeInfo() {
            return this.$__0;
          },
          set _typeInfo(value) {
            this.$__0 = value;
          },
          get _getters() {
            return this.$__1;
          },
          set _getters(value) {
            this.$__1 = value;
          },
          get _setters() {
            return this.$__2;
          },
          set _setters(value) {
            this.$__2 = value;
          },
          get _methods() {
            return this.$__3;
          },
          set _methods(value) {
            this.$__3 = value;
          },
          get reflectionCapabilities() {
            return this.$__4;
          },
          set reflectionCapabilities(value) {
            this.$__4 = value;
          },
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
            if (MapWrapper.contains(this._typeInfo, type)) {
              return MapWrapper.get(this._typeInfo, type)["factory"];
            } else {
              return this.reflectionCapabilities.factory(type);
            }
          },
          parameters: function(typeOfFunc) {
            if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
              return MapWrapper.get(this._typeInfo, typeOfFunc)["parameters"];
            } else {
              return this.reflectionCapabilities.parameters(typeOfFunc);
            }
          },
          annotations: function(typeOfFunc) {
            if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
              return MapWrapper.get(this._typeInfo, typeOfFunc)["annotations"];
            } else {
              return this.reflectionCapabilities.annotations(typeOfFunc);
            }
          },
          getter: function(name) {
            if (MapWrapper.contains(this._getters, name)) {
              return MapWrapper.get(this._getters, name);
            } else {
              return this.reflectionCapabilities.getter(name);
            }
          },
          setter: function(name) {
            if (MapWrapper.contains(this._setters, name)) {
              return MapWrapper.get(this._setters, name);
            } else {
              return this.reflectionCapabilities.setter(name);
            }
          },
          method: function(name) {
            if (MapWrapper.contains(this._methods, name)) {
              return MapWrapper.get(this._methods, name);
            } else {
              return this.reflectionCapabilities.method(name);
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
  function require(path) {
    return $traceurRuntime.require("reflection/types", path);
  }
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
    function require(path) {
        return $traceurRuntime.require("rtts_assert/rtts_assert", path);
    }
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
                         $__1; !($__1 = $__0.next()).done; ) {
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
                         $__1; !($__1 = $__0.next()).done; ) {
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
                     $__1; !($__1 = $__0.next()).done; ) {
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

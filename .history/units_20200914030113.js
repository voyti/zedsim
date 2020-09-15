const UNIT_LOOP_DECISION_MAKING_THRESHOLD = 100;
const ZOMBIE_ROAM_DISTANCE = 100;
const NON_ZOMBIE_UNITS = ['nationalGuard', 'abConUnit', 'abExUnit', 'civilian'];
export class Units {


  constructor(appBoard, config, positioningService, spritesService) {
    this.config = config;
    this.positioningService = positioningService;
    this.spritesService = spritesService;

    this.zombies = [];
    this.nationalGuards = [];
    this.abConUnits = [];
    this.abExUnits = [];
    this.civExUnits = [];
    this.civilians = [];
  }

  getAllUnits() {
    return [
      ...this.zombies,
      ...this.nationalGuards,
      ...this.abConUnits,
      ...this.abExUnits,
      ...this.civExUnits,
      ...this.civilians
    ];
  }

  getUnitsByType(unitType) {
    const typeToUnitsMap = {
      'zombie': this.zombies,
      'nationalGuard': this.nationalGuards,
      'abCon': this.abConUnits,
      'abEx': this.abExUnits,
      'civEx': this.civExUnits,
      'civilian': this.civilians,
    };

    return typeToUnitsMap[unitType];
  }

  spawnNewUnitInRandomLocation(areaStart, areaEnd,  unitType) {
    const unit = this.getNewUnit(unitType);
    const spawnX = _.random(areaStart.x, areaEnd.x);
    const spawnY = _.random(areaStart.y, areaEnd.y);

    const correctedSpawnPoint = this.positioningService.correctPointToNearestWalkable({x: spawnX,  y: spawnY});
    unit.sprite.x = correctedSpawnPoint.x;
    unit.sprite.y = correctedSpawnPoint.y;

    return unit;
  }

  getNewUnit(type) {
    const baseProps = {
      sprite: this.spritesService.getUnitSprite(type),
      id: Math.random().toString(24).substring(2),
      currentBehavior: 'idle',
      currentPath: null,
      currentPathStep: null,
      lastMovedPass: null,
      experiencedLoops: 0,
    };

    const zombie = {
      speed: 0.2,
      type: 'zombie',
      detectionRange: 100,
    };

    const civilian = {
      speed: 0.1,
      type: 'civilian',
      detectionRange: 120,
    };

    const civEx = {
      speed: 1,
      type: 'civEx',
      detectionRange: 120,
    };

    const typeToUnitMap = {
      'zombie': zombie,
      'civilian': civilian,
      'civEx': civEx,
      // 'nationalGuard': this.nationalGuards,
      // 'abCon': this.abConUnits,
      // 'abEx': this.abExUnits,
    };
    const unit = Object.assign(typeToUnitMap[type], baseProps);

    this.getUnitsByType(type).push(unit);

    return unit;
  }

  requestUnitAction(unit, loopCount) {
    unit.experiencedLoops++;
    // const unitTypeToDecisionMap = {
    //   'zombie': () => this.decideZombieBehavior(unit),
    //   'nationalGuard': () => this.decideNationalGuardBehavior(unit),
    //   'abConUnit': () => this.decideAbConBehavior(unit),
    //   'abExUnit': () => this.decideAbExUnitBehavior(unit),
    //   'civilian': () => this.decideCivilianBehavior(unit),
    // };

    const isThisLoopDecisionLoop = unit.experiencedLoops % UNIT_LOOP_DECISION_MAKING_THRESHOLD === 0;

    if (isThisLoopDecisionLoop) {
      if (!(this.isCurrentUnitBehaviorHighestPriority(unit) && unit.currentPath)) {
        this.decideUnitBehavior(unit, loopCount);
      } else {
        this.increaseUnitStep(unit, loopCount)
      }
    } else if (unit.currentPath) {
      this.increaseUnitStep(unit, loopCount)
    }
  }

  isCurrentUnitBehaviorHighestPriority(unit) {
    const unitBehaviors = this.getUnitTypeBehaviors(unit.type);
    return unit.currentBehavior === _.orderBy(unitBehaviors, 'priority', ['desc']).type;
  }

  getUnitTypeBehaviors(type) {

    const zombieBehaviors = [
      {
        type: 'idle',
        priority: 0,
        condition: () => true,
      },
      {
        type: 'roam',
        priority: 1,
        condition: () => true,
        action: (unit) => this.moveUnitInDirection(unit, this.getRandomDirection(), ZOMBIE_ROAM_DISTANCE),
      }, {
        type: 'pursuit',
        priority: 2,
        condition: (unit) => this.getUnitsInRange(NON_ZOMBIE_UNITS, unit),
        conditionRelevantParam: 'length',
        action: (unit, conditionResult) => this.moveUnitTowardsAnother(unit, conditionResult[0]),
      }
    ];

    const civilianBehaviors = [
      {
        type: 'idle',
        priority: 0,
        condition: () => true,
      },
      {
        type: 'proceedToExtraction',
        priority: 1,
        condition: () => true,
        action: (unit) => this.moveUnitInDirection(unit, this.getRandomDirection(), ZOMBIE_ROAM_DISTANCE),
      }, {
        type: 'pursuit',
        priority: 2,
        condition: (unit) => this.getUnitsInRange(NON_ZOMBIE_UNITS, unit),
        conditionRelevantParam: 'length',
        action: (unit, conditionResult) => this.moveUnitTowardsAnother(unit, conditionResult[0]),
      }
    ];

    const typeBehaviorsMap = {
      'zombie': zombieBehaviors,
      'civilian': civilianBehaviors,
    }

    return typeBehaviorsMap[type]
  }

  decideUnitBehavior(unit, loopCount) {
    const unitBehaviors = this.getUnitTypeBehaviors(unit.type);
    const behaviorsByImportance = _.orderBy(unitBehaviors, 'priority', ['desc']);

    _.forEach(behaviorsByImportance, (behavior) => {
      const conditionResult = behavior.condition(unit);
      const relevantParam = behavior.conditionRelevantParam;

      if (relevantParam ? conditionResult[relevantParam] : conditionResult) {
        if (unit.currentBehavior === behavior.type && unit.currentPath) {
          this.increaseUnitStep(unit, loopCount);
        } else {
          (behavior.action || _.noop)(unit, conditionResult);
          if (unit.currentBehavior !== behavior.type) {
            console.warn('BEHAVIOR: ', unit.type, ' is switching from ', unit.currentBehavior, ' to ', behavior.type);
          }
          unit.currentBehavior = behavior.type;
        }
        return false;
      }
    });
  }

  getUnitsInRange(unitTypes, centerUnit) {
    const relevantUnits = _.filter(this.getAllUnits(), (unit) => _.includes(unitTypes, unit.type));
    const unitsWithDistances = _.map(relevantUnits, (unit) => ({
      unit,
      distanceTo: this.positioningService.getDistanceBetweenPoints(centerUnit, unit),
    }));
    const unitsInRange = _.filter(unitsWithDistances,  (unitDist) => unitDist.distanceTo <= detectionRange);

    return _.map(_.orderBy(unitsInRange,  'distanceTo'), 'unit');
  }

  getRandomDirection() {
    return _.random(0, 360);
  }

  moveUnitInDirection(unit, degrees, distance) {
    const walkablePoint = this.positioningService.getWalkablePointAroundUnitInDistance(unit, distance, degrees);
    unit.currentPath = [];

    this.positioningService.getPathFromTo({ x: unit.sprite.x, y: unit.sprite.y }, walkablePoint, (path) => {
      unit.currentPath = path;
      unit.currentPathStep = 0;
    });
  }

  moveUnitTowardsAnother(unitToMove, targetUnit) {
    // unit.currentPath = this.positioningService.getPathFromSpriteTo(unit.sprite, walkablePoint);
    unit.currentPathStep = 0;
  }

  isUnitPresent(unitType) {

  }

  increaseUnitStep(unit, loopPass) {
    if (unit.currentPath && (!unit.lastMovedPass || (loopPass % (Math.floor(1 / unit.speed))) === 0 )) {
      if (unit.currentPath.length && unit.currentPathStep >= unit.currentPath.length - 1) {
        unit.currentPath = null;
        unit.currentPathStep = null;
      } else {
        // path as empty array means path calculation is pending
        if (unit.currentPath.length) {
          unit.currentPathStep++;

          unit.sprite.x = unit.currentPath[unit.currentPathStep].x;
          unit.sprite.y = unit.currentPath[unit.currentPathStep].y;
          unit.lastMovedPass = loopPass;
        }
      }
    }
  }

}

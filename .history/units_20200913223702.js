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

  spawnNewUnitInRandomLocation(areaStart, areaEnd,  unitType, sprite) {
    const unit
  }

  getNewUnit(sprite, type) {
    const zombie = {
      sprite,
      id: Math.random().toString(24).substring(2),
      speed: 0.3,
      type: 'zombie',
      detectionRange: 100,

      currentBehavior: 'idle',
      currentPath: null,
      currentPathStep: null,
      lastMovedPass: null,
      experiencedLoops: 0,
    };

    this.zombies.push(zombie);

    return zombie;
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

    const typeBehaviorsMap = {
      'zombie': zombieBehaviors,
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

  increaseUnitStep(unit, loopPass) {
    if (unit.currentPath && (!unit.lastMovedPass || (loopPass % (Math.floor(1 / unit.speed))) === 0 )) {
      if (unit.currentPathStep >= unit.currentPath.length - 1) {
        unit.currentPath = null;
        unit.currentPathStep = null;
      } else {
        unit.currentPathStep++;

        unit.sprite.x = unit.currentPath[unit.currentPathStep].x;
        unit.sprite.y = unit.currentPath[unit.currentPathStep].y;
        unit.lastMovedPass = loopPass;
      }
    }
  }

}

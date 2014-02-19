var b2Vec2 = Box2D.Common.Math.b2Vec2, b2AABB = Box2D.Collision.b2AABB, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw, b2Shape = Box2D.Collision.Shapes.b2Shape, b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

var BODY_TYPE = {
	STATIC : 0,
	DYNAMIC : 1
};
var DEFAULTS = {
	DENSITY : 1.0,
	FRICTION : 0.5,
	RESTITUTION : 0.4
};

function PhysicsWorld(gravityX, gravityY) {
	this.world = new b2World(new b2Vec2(gravityX, gravityY), true);
}

PhysicsWorld.prototype.step = function(delta) {
	this.world.Step(delta / 1000, 10, 10);
	this.world.ClearForces();
	this.updateBodyStates();
};

PhysicsWorld.prototype.updateBodyStates = function() {
	for (var b = this.world.GetBodyList(); b != null; b = b.GetNext()) {
		if (typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
			var velocity = b.GetLinearVelocity();
			objState = {
				x : b.GetPosition().x,
				y : b.GetPosition().y,
				angle : b.GetAngle(),
				vx : velocity.x,
				vy : velocity.y
			};
			ourObj = b.GetUserData();
			ourObj.update(objState);
		}
	}
};

PhysicsWorld.prototype.addBody = function(body, bodyProperties) {
	// TODO don't return the body, facade it somehow
	if (body instanceof RectangleEntity) {
		return this.addRectangleBody(body, bodyProperties);
	} else if (body instanceof CircleEntity) {
		return this.addCircleBody(body, bodyProperties);
	}
};

PhysicsWorld.prototype.addRectangleBody = function(rect, bodyProperties) {
	var fixDef = new b2FixtureDef();
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(rect.halfWidth, rect.halfHeight);
	return this.addBodyWithFixdef(rect, bodyProperties, fixDef);
};

PhysicsWorld.prototype.addCircleBody = function(circle, bodyProperties) {
	var fixDef = new b2FixtureDef();
	fixDef.shape = new b2CircleShape(circle.radius);
	return this.addBodyWithFixdef(circle, bodyProperties, fixDef);
};

PhysicsWorld.prototype.addBodyWithFixdef = function(body, bodyProperties,
		fixDef) {
	var bodyDef = new b2BodyDef();
	setBodyDefProperties(bodyDef, bodyProperties);
	setFixDefProperties(fixDef, bodyProperties);
	bodyDef.position.Set(body.x, body.y);
	bodyDef.angle = body.angle;
	bodyDef.userData = body;
	var createdBody=this.world.CreateBody(bodyDef);
	createdBody.CreateFixture(fixDef);
	return createdBody;
};

function setBodyDefProperties(bodyDef, bodyProperties) {
	bodyDef.type = bodyProperties.type === BODY_TYPE.DYNAMIC ? b2Body.b2_dynamicBody
			: b2Body.b2_staticBody;
	if (bodyProperties.linearDamping != undefined) {
		bodyDef.linearDamping = bodyProperties.linearDamping;
	}
	if (bodyProperties.angularDamping != undefined) {
		bodyDef.angularDamping = bodyProperties.angularDamping;
	}
	if (bodyProperties.fixedRotation !== undefined) {
		bodyDef.fixedRotation = bodyProperties.fixedRotation;
	}
}

function setFixDefProperties(fixDef, bodyProperties) {
	fixDef.friction = bodyProperties.friction !== undefined ? bodyProperties.friction
			: DEFAULTS.FRICTION;
	fixDef.density = bodyProperties.density !== undefined ? bodyProperties.density
			: DEFAULTS.DENSITY;
	fixDef.restitution = bodyProperties.restitution !== undefined ? bodyProperties.restitution
			: DEFAULTS.RESTITUTION;
}
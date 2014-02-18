var CONFIG = {
	GAME_WIDTH : 600,
	GAME_HEIGHT : 300,
	BGCOLOR : "#00bfff",
	BALL_RADIUS : 5
};


var SCALE = 30;

var b2Vec2 = Box2D.Common.Math.b2Vec2, b2AABB = Box2D.Collision.b2AABB, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw, b2Shape = Box2D.Collision.Shapes.b2Shape, b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

function Entity(x, y, angle) {
	this.x = x;
	this.y = y;
	this.angle = (angle === undefined ? 0 : angle);
}

Entity.prototype.update = function(state) {
	this.x = state.x;
	this.y = state.y;
	this.angle = state.angle;
};

function RectangleEntity(x, y, halfWidth, halfHeight) {
	Entity.call(this, x, y);
	this.halfWidth = halfWidth;
	this.halfHeight = halfHeight;
}
RectangleEntity.prototype = new Entity();
RectangleEntity.prototype.constructor = RectangleEntity;

RectangleEntity.prototype.draw = function(ctx) {
	ctx.save();
	ctx.translate(this.x * SCALE, this.y * SCALE);
	ctx.rotate(this.angle);
	ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
	ctx.fillStyle = 'red';
	ctx.fillRect((this.x - this.halfWidth) * SCALE, (this.y - this.halfHeight)
			* SCALE, (this.halfWidth * 2) * SCALE, (this.halfHeight * 2)
			* SCALE);
	ctx.restore();

//	Entity.prototype.draw.call(this, ctx);
};

function Game() {

}

Game.prototype.tick = function(delta) {

};

function GameRenderer(ctx, world) {
	this.ctx = ctx;
	this.world = world;
}

GameRenderer.prototype.render = function() {
	this.ctx.clearRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
	//world.DrawDebugData();
	for (var b = world.GetBodyList(); b != null; b = b.GetNext()) {
		if (typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null)  {
			ourObj = b.GetUserData();
			ourObj.draw(this.ctx);
		}
	}
};

var ctx = setupCanvasContext(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

function enableDebugDraw() {
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(30.0);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);
}

var renderer = new GameRenderer(ctx, world);
var game = new Game();

function renderAndRequestNewFrame() {
	renderer.render();
	requestAnimationFrame(t.tick);
}

var world = new b2World(new b2Vec2(0, 10) // gravity
, true // allow sleep
);

function tickGame(delta) {
	world.Step(delta / 1000, 10, 10);
	world.ClearForces();
	game.tick(delta);
	for (var b = world.GetBodyList(); b != null; b = b.GetNext()) {
		if (typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null)  {
			objState = {x: b.GetPosition().x, y: b.GetPosition().y, angle : b.GetAngle()};
			ourObj = b.GetUserData();
			ourObj.update(objState);
		}
	}
}


var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.5;
fixDef.restitution = 0.6;

var bodyDef = new b2BodyDef;

function createB2Rect(rect, userData, type) {
	bodyDef.type = type;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(rect.halfWidth, rect.halfHeight);
	bodyDef.position.Set(rect.x, rect.y);
	bodyDef.userData = userData;
	world.CreateBody(bodyDef).CreateFixture(fixDef);	
}

var myRect = new RectangleEntity(3, 3, 2, 2);
var ground = new RectangleEntity(0, 9.8, 20, 0.2);
var obstacle = new RectangleEntity(2, 9.5, 0.3, 1);

createB2Rect(myRect, myRect, b2Body.b2_dynamicBody);
createB2Rect(ground, ground, b2Body.b2_staticBody);
createB2Rect(obstacle, obstacle, b2Body.b2_dynamicBody);

var t = new Ticker(tickGame, renderAndRequestNewFrame);
renderAndRequestNewFrame();

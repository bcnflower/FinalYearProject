var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mytestdb.db');
var check;
db.serialize(function() {
	var name = "testing"//user_info
	db.run("DELETE FROM "+name);
	db.run("CREATE TABLE if not exists "+name+" (info TEXT)");
	var stmt = db.prepare("INSERT INTO "+name+" VALUES (?)");
	for (var i = 0; i < 10; i++) {
		stmt.run("Ipsum " + i);
	}
	stmt.finalize();
	db.each("SELECT rowid AS id, info FROM "+name, function(err, row) {
		console.log(row.id + ": " + row.info);
	});

	db.get("SELECT count(*) as exist FROM sqlite_master WHERE type='table' AND name='testing';", function(err, row) {
		console.log("ex=",row.exist);
	});
});
db.close();


   // ╭─────────────────────────────────────╮
   // │                                     │
   // │   Update available 2.0.7 → 2.0.8    │
   // │     Run npm i nodemon to update     │
   // │                                     │
   // ╰─────────────────────────────────────╯
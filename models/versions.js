module.exports = function(sequelize, DataTypes) {
    var Version = sequelize.define("version", {
    });
    Version.associate = function(models) {
        Version.hasMany(models.model, {
            onDelete: "cascade"
        });
        Version.belongsTo(models.project);
    };
    return Version;
}

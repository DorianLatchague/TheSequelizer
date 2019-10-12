module.exports = function(sequelize, DataTypes) {
    var Project = sequelize.define("project", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    Project.associate = function(models) {
        Project.belongsTo(models.user);
        Project.hasMany(models.version, {
            onDelete: "cascade"
        });
    };
    return Project;
}

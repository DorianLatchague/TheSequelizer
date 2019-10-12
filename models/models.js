module.exports = function(sequelize, DataTypes) {
    var Model = sequelize.define("model", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    Model.associate = function(models) {
        Model.belongsTo(models.version);
        Model.hasMany(models.association, {
            onDelete: "cascade"
        });
        Model.hasMany(models.field, {
            onDelete: "cascade"
        });
    };
    return Model;
}

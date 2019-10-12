module.exports = function(sequelize, DataTypes) {
    var Field = sequelize.define("field", {
        field: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        allowNull: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });
    Field.associate = function(models) {
        Field.belongsTo(models.model);
    };
    return Field;
}

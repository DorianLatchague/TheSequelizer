module.exports = function(sequelize, DataTypes) {
    var Association = sequelize.define("association", {
        associate: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    Association.associate = function(models) {
        Association.belongsTo(models.model);
    };
    return Association;
}

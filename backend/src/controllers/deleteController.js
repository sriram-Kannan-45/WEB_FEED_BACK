const { User, TrainerProfile } = require('../models');

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (parseInt(id) === adminId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    if (user.role === 'TRAINER') {
      await TrainerProfile.destroy({ where: { userId: id } });
    }

    await User.destroy({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

module.exports = { deleteUser };
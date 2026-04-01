import chalk from 'chalk';

export const logger = {
  success: (msg) => console.log(chalk.green('✔ ' + msg)),
  error: (msg) => console.error(chalk.red('✖ ' + msg)),
  warn: (msg) => console.warn(chalk.yellow('⚠ ' + msg)),
  info: (msg) => console.log(chalk.cyan('ℹ ' + msg)),
  dim: (msg) => console.log(chalk.dim(msg)),
};

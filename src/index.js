#! /usr/bin/env node
import {Command} from 'commander';
import run from "./commands/run.js";
import ps from "./commands/ps.js";
import rm from "./commands/rm.js";
import _export from './commands/export.js';

const program = new Command();

program
    .name('cielago')
    .version('0.0.7')
    .description('Cielago is a cli tool for twitter space. It can run a listener for twitter space and export data to csv file. Author: @tunogya')

program
    .command('run')
    .description('run a listener for twitter space')
    .argument('<url>', 'twitter space url or id')
    .action(run)

program
    .command('ps')
    .description('list all twitter spaces')
    .action(ps)

program
    .command('rm')
    .description('remove a twitter space record')
    .option('-a, --all', 'remove all twitter space record')
    .argument('[urls...]', 'twitter space urls or ids')
    .action(rm)

program
    .command('export')
    .description('export a twitter space log')
    .argument('[urls...]', 'twitter space urls or ids')
    .action(_export)

program.parse();

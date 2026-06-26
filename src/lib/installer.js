import { mkdirSync, writeFileSync, symlinkSync, existsSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { canonicalSkillsDir, GLOBAL_PATHS } from './agents.js'

// Install skill files to a target directory
export function installSkillFiles(targetDir, skillName, files) {
  const skillDir = join(targetDir, skillName)
  mkdirSync(skillDir, { recursive: true })
  for (const file of files) {
    writeFileSync(join(skillDir, file.name), file.content, 'utf8')
  }
  return skillDir
}

// Install a skill globally to a user-level skills directory
export function installSkillGlobal({ skillName, files, skillsDir = GLOBAL_PATHS.claudeSkills }) {
  return installSkillFiles(skillsDir, skillName, files)
}

// Create a symlink from agentSkillDir/skillName → canonical/skillName
// Falls back to copy if symlinks are not supported (Windows without admin)
export function symlinkOrCopy(canonicalSkillDir, agentSkillDir, skillName, files) {
  const linkPath = join(agentSkillDir, skillName)
  mkdirSync(agentSkillDir, { recursive: true })

  if (existsSync(linkPath)) {
    rmSync(linkPath, { recursive: true, force: true })
  }

  try {
    symlinkSync(canonicalSkillDir, linkPath, 'junction')
    return { mode: 'symlink', path: linkPath }
  } catch {
    // Fallback: copy files directly
    installSkillFiles(agentSkillDir, skillName, files)
    return { mode: 'copy', path: linkPath }
  }
}

// Remove a skill from a directory
export function removeSkill(skillsDir, skillName) {
  const skillDir = join(skillsDir, skillName)
  if (!existsSync(skillDir)) return false
  rmSync(skillDir, { recursive: true, force: true })
  return true
}

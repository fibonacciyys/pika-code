import { spawn } from 'bun'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DIST_DIR = 'dist'
const VERSION = '0.0.1'
const BUILD_TIME = new Date().toISOString().split('T')[0]

const EXTERNAL_MODULES = [
  '@anthropic-ai/bedrock-sdk',
  '@anthropic-ai/foundry-sdk',
  '@anthropic-ai/vertex-sdk',
  '@azure/identity',
  '@aws-sdk/client-bedrock',
  '@aws-sdk/client-sts',
  'sharp',
  'turndown',
  '@opentelemetry/exporter-metrics-otlp-grpc',
  '@opentelemetry/exporter-metrics-otlp-http',
  '@opentelemetry/exporter-metrics-otlp-proto',
  '@opentelemetry/exporter-prometheus',
  '@opentelemetry/exporter-logs-otlp-grpc',
  '@opentelemetry/exporter-logs-otlp-http',
  '@opentelemetry/exporter-logs-otlp-proto',
  '@opentelemetry/exporter-trace-otlp-grpc',
  '@opentelemetry/exporter-trace-otlp-http',
  '@opentelemetry/exporter-trace-otlp-proto',
]

const MACRO_DEFINES = {
  VERSION: `"${VERSION}"`,
  BUILD_TIME: `"${BUILD_TIME}"`,
  PACKAGE_URL: `"pika-code"`,
  NATIVE_PACKAGE_URL: `"pika-code"`,
  VERSION_CHANGELOG: `""`,
  ISSUES_EXPLAINER: `"file an issue at https://github.com/your-org/pika-code/issues"`,
  FEEDBACK_CHANNEL: `"github"`,
}

const TARGETS = {
  linux: 'linux-x64',
  darwin: 'darwin-x64',
  darwin_arm: 'darwin-arm64',
  windows: 'windows-x64',
}

function buildArgs(outfile: string, target?: string): string[] {
  const args = [
    'build',
    '--compile',
    `--outfile=${outfile}`,
  ]
  
  if (target) {
    args.push(`--target=${target}`)
  }
  
  for (const [key, value] of Object.entries(MACRO_DEFINES)) {
    args.push(`--define=MACRO.${key}='${value}'`)
  }
  
  for (const mod of EXTERNAL_MODULES) {
    args.push(`--external=${mod}`)
  }
  
  args.push('./src/entrypoints/cli.tsx')
  
  return args
}

async function runBuild(args: string[]): Promise<void> {
  const proc = spawn({
    cmd: ['bun', ...args],
    stdout: 'inherit',
    stderr: 'inherit',
  })
  
  const result = await proc.exited
  
  if (result !== 0) {
    throw new Error(`Build failed with exit code ${result}`)
  }
}

async function buildForTarget(target: string, outfile: string) {
  console.log(`Building for ${target}...`)
  console.log(`Output: ${outfile}`)
  
  await runBuild(buildArgs(outfile, target))
  
  console.log(`Done: ${outfile}`)
}

async function buildCurrentPlatform() {
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true })
  }

  const outfile = join(DIST_DIR, 'pika-code')
  
  console.log('Building for current platform...')
  console.log(`Output: ${outfile}`)
  
  await runBuild(buildArgs(outfile))
  
  console.log(`Done: ${outfile}`)
}

async function buildAllPlatforms() {
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true })
  }

  for (const [name, target] of Object.entries(TARGETS)) {
    const ext = name === 'windows' ? '.exe' : ''
    const suffix = name === 'darwin_arm' ? '-macos-arm' : 
                   name === 'darwin' ? '-macos' : 
                   name === 'linux' ? '-linux' : ''
    const outfile = join(DIST_DIR, `pika-code${suffix}${ext}`)
    
    await buildForTarget(target, outfile)
  }
  
  console.log('\nAll builds completed in dist/')
}

const platform = process.argv[2]

if (platform === 'all') {
  await buildAllPlatforms()
} else if (platform && TARGETS[platform as keyof typeof TARGETS]) {
  const target = TARGETS[platform as keyof typeof TARGETS]
  const ext = platform === 'windows' ? '.exe' : ''
  const outfile = join(DIST_DIR, `pika-code-${platform}${ext}`)
  
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true })
  }
  
  await buildForTarget(target, outfile)
} else {
  await buildCurrentPlatform()
}
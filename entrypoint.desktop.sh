#!/bin/bash

# Docker Entrypoint Script for Claude Code Linux Preparation
# Runs as root and initializes the container environment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Main entrypoint execution
main() {
    log_info "Starting Docker entrypoint script..."
    log_info "Running as user: $(whoami)"

    # Verify we're running as root
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi

    log_success "Root verification passed"

    # Step 1: Clean up Playwright cache
    log_info "Cleaning up Playwright cache..."
    if rm -rf /home/claude/.cache/ms-playwright/mcp-chrome-* 2>/dev/null; then
        log_success "Playwright cache cleaned successfully"
    else
        log_warning "Could not clean Playwright cache (may not exist yet)"
    fi

    # Step 2: Ensure /workspace has correct permissions
    log_info "Setting up /workspace permissions..."
    if [[ -d "/workspace" ]]; then
        if chown -R claude:claude /workspace 2>/dev/null; then
            log_success "/workspace ownership set to claude:claude"
        else
            log_error "Failed to set /workspace ownership"
            exit 1
        fi

        if chmod -R 755 /workspace 2>/dev/null; then
            log_success "/workspace permissions set to 755"
        else
            log_error "Failed to set /workspace permissions"
            exit 1
        fi
    else
        log_warning "/workspace directory does not exist, skipping permissions setup"
    fi

    # Step 3: Check if Claude Code is authenticated
    log_info "Checking Claude Code authentication..."
    CLAUDE_HOME="/home/claude/.claude"
    CLAUDE_CONFIG="${CLAUDE_HOME}/config.json"

    if [[ -f "${CLAUDE_CONFIG}" ]]; then
        if grep -q '"apiKey"' "${CLAUDE_CONFIG}" 2>/dev/null; then
            log_success "Claude Code appears to be authenticated"
        else
            log_warning "Claude Code config found but API key not configured"
            echo ""
            log_warning "Please configure Claude Code authentication by running:"
            echo -e "${YELLOW}  claude login${NC}"
            echo ""
        fi
    else
        log_warning "Claude Code not authenticated"
        echo ""
        log_warning "Please authenticate Claude Code by running:"
        echo -e "${YELLOW}  claude login${NC}"
        echo ""
    fi

    # Step 4: Display startup summary
    echo ""
    log_info "Container initialization summary:"
    log_info "  - Root verification: PASSED"
    log_info "  - Playwright cache cleanup: DONE"
    log_info "  - Workspace permissions: CONFIGURED"
    log_info "  - Authentication check: COMPLETE"
    echo ""

    # Step 5: Start supervisor in foreground
    log_info "Starting supervisor service..."
    log_info "Supervisor will run in foreground mode"
    echo ""

    if [[ ! -f "/etc/supervisor/conf.d/supervisor.conf" ]]; then
        log_error "Supervisor configuration file not found at /etc/supervisor/conf.d/supervisor.conf"
        exit 1
    fi

    log_success "All pre-flight checks passed, starting supervisor..."
    echo ""

    # Execute supervisor - this replaces the current process
    exec supervisord -n -c /etc/supervisor/conf.d/supervisor.conf
}

# Error handling
trap 'log_error "Script encountered an error on line $LINENO"; exit 1' ERR

# Run main function
main "$@"

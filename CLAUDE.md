# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal charitable donation tracker web application built with React, TypeScript, and Zod. The app tracks organizations and donations for each organization, storing data as a single JSON file via a web service (no database or backend logic in this repo). The UI uses only simple built-in HTML and CSS for styling.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Coding standards

- Functional immutable style
- Use arrow functions whenever possible
- Only use code comments when something is not obvious
#!/usr/bin/env python3
"""
Seed script to create test data for BookTutor.
Run this after starting the services to populate the database.

Usage:
    python scripts/seed_data.py
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

os.chdir(backend_path)

from app.core.config import settings
from app.services.ingest_service import ingest_service


def seed_asignaturas():
    """Create and ingest sample asignaturas."""
    
    asignaturas = [
        {
            "slug": "programacion",
            "name": "Programación",
            "icon": "💻",
            "docs_dir": settings.docs_path / "programacion"
        },
        {
            "slug": "bases-de-datos",
            "name": "Bases de Datos",
            "icon": "🗄️",
            "docs_dir": settings.docs_path / "bases-de-datos"
        }
    ]
    
    print("=" * 50)
    print("BookTutor - Seed Data Script")
    print("=" * 50)
    print()
    
    for asig in asignaturas:
        slug = asig["slug"]
        docs_dir = asig["docs_dir"]
        
        print(f"📚 Processing: {asig['name']} ({slug})")
        
        # Check if docs exist
        if not docs_dir.exists():
            print(f"   ⚠️  Directory not found: {docs_dir}")
            continue
            
        md_files = list(docs_dir.glob("*.md"))
        if not md_files:
            print(f"   ⚠️  No .md files found in {docs_dir}")
            continue
            
        print(f"   📄 Found {len(md_files)} markdown files")
        
        # Check if collection exists
        if ingest_service.qdrant.collection_exists(slug):
            print(f"   🔄 Collection exists, re-ingesting...")
            ingest_service.delete_book(slug)
        
        # Ingest
        print(f"   ⏳ Ingesting documents...")
        result = ingest_service.ingest_book(slug, docs_dir)
        
        if result.status.value == "ready":
            print(f"   ✅ Success! {result.chunks_count} chunks created")
        else:
            print(f"   ❌ Error: {result.error}")
        
        print()
    
    # List all collections
    print("=" * 50)
    print("📋 Available collections:")
    for slug in ingest_service.list_books():
        status = ingest_service.get_book_status(slug)
        print(f"   • {slug}: {status['chunks_count']} chunks ({status['status']})")
    
    print()
    print("✨ Seed completed!")
    print()
    print("You can now:")
    print("  1. Login at http://localhost:3000/login")
    print("  2. Use admin/admin123 to access admin panel")
    print("  3. Chat with the tutor at /asignatura/programacion/01-introduccion-python")
    print()


if __name__ == "__main__":
    seed_asignaturas()

find content -type f -name '*.md' | while read -r file; do
  awk '
  BEGIN { in_notice = 0 }
  /{{% notice style="tip" title="Ressources" icon="book" %}}/ {
    in_notice = 1;
    print "> [!ressource] Ressources";
    next;
  }
  in_notice && /{{% \/notice %}}/ {
    in_notice = 0; 
    next;
  }
  in_notice && /^-/ { sub(/^-/, "> -"); }
  { print }
  ' "$file" > temp.md && mv temp.md "$file"
done


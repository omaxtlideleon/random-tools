#include <stdio.h>
#include <stddef.h>
#include <stdbool.h>

#define ARENA_SIZE 1024 * 64 // 64 KiB arena

static unsigned char arena[ARENA_SIZE];

typedef struct BlockHeader {
    size_t size;               // Size of the usable data block (excluding this header)
    bool is_free;              // True if this block can be taken
    struct BlockHeader* next;  // Pointer to the next block in the arena
} BlockHeader;

// Global pointer to the start of the memory list
static BlockHeader* head = NULL;

// initialize arena on the first allocation call
static void init_arena() {
    head = (BlockHeader*)arena;
    head->size = ARENA_SIZE - sizeof(BlockHeader);
    head->is_free = true;
    head->next = NULL;
}

// finds a free block, optionally splits it, and returns a pointer.
void* my_malloc(size_t size) {
    if (size == 0) {
        return NULL;
    }

    // 8 bytes
    size = (size + 7) & ~7;

    // If this is the very first call:
    if (head == NULL) {
        init_arena();
    }

    BlockHeader* current = head;
    
    // find the first block that fits
    while (current != NULL) {
        if (current->is_free && current->size >= size) {
            
            // Check if we can split the block
            // Needs enough room for the requested size, a new header, and at least 8 bytes of data.
            if (current->size >= size + sizeof(BlockHeader) + 8) {
                // Where the new split header will live?
                BlockHeader* next_block = (BlockHeader*)((char*)current + sizeof(BlockHeader) + size);
                
                // Set up the new remaining free block
                next_block->size = current->size - size - sizeof(BlockHeader);
                next_block->is_free = true;
                next_block->next = current->next;

                // Update the current block to match the size
                current->size = size;
                current->next = next_block;
            }

            current->is_free = false;
            
            // Return pointer to the usable memory
            return (void*)(current + 1);
        }
        current = current->next;
    }

    // OOM (no fitting block found)
    return NULL;
}

// Marks a block as free and combines adjacent free blocks to prevent fragmentation
void my_free(void* ptr) {
    if (ptr == NULL) {
        return;
    }

    // Get the header belonging to this pointer by shifting backward
    BlockHeader* block = (BlockHeader*)ptr - 1;
    block->is_free = true;

    // scan the list and merge consecutive free blocks
    BlockHeader* current = head;
    while (current != NULL && current->next != NULL) {
        if (current->is_free && current->next->is_free) {
            // "Absorb" the next block's size and its header size into the current block
            current->size += sizeof(BlockHeader) + current->next->size;
            // Skip the absorbed block
            current->next = current->next->next;
        } else {
            current = current->next;
        }
    }
}

void debug_dump_arena() {
    printf("\n--- Arena State ---\n");
    BlockHeader* current = head;
    int block_num = 0;
    while (current != NULL) {
        printf("Block %d | Address: %p | Size: %zu bytes | Status: %s\n", 
               block_num++, (void*)current, current->size, current->is_free ? "FREE" : "ALLOCATED");
        current = current->next;
    }
    printf("-------------------\n");
}

int main() {
    printf("Allocating A, B, and C...\n");
    int* a = (int*)my_malloc(100 * sizeof(int)); // 400 bytes
    char* b = (char*)my_malloc(50);              // 56 bytes (aligned)
    int* c = (int*)my_malloc(20 * sizeof(int));  // 80 bytes
    
    debug_dump_arena();
    // Makes a fragmentation
    printf("\nFreeing B...\n");
    my_free(b);
    debug_dump_arena();
    // Should fit into B's old slot if small enough
    printf("\nAllocating D...\n");
    char* d = (char*)my_malloc(20); // 24 bytes (aligned)
    debug_dump_arena();
    // Triggers merging
    printf("\nFreeing A and D...\n");
    my_free(a);
    my_free(d); // Leaves blocks free next to eachother, which will merge during the free loop
    debug_dump_arena();

    return 0;
}

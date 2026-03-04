# Compiler settings
CXX = g++
CXXFLAGS = -Wall -Wextra -std=c++17 -I mongoose_dependencies

# The name of your final executable
TARGET = main

# List of source files
SRCS = main.cpp mongoose_dependencies/mongoose.cpp

# Generate object file names by replacing .cpp with .o
OBJS = $(SRCS:.cpp=.o)

# Default target that runs when you just type 'make'
all: $(TARGET)

# Rule to link object files into the final executable
$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(OBJS)

# Rule to compile .cpp files into .o object files
%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Rule to clean up compiled files
clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all clean
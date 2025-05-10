import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
import math
from .models import Room, ResultAlgorithm
import io
from django.core.files.base import ContentFile

def CoverageOptimizationFOAAlgorithm(data: dict):

    VarMaxx = 100
    VarMaxy = 100
    Rc = int(data["Rc"])
    Rs = int(data["Rs"])
    N = int(data["number_node"])
    MaxIt = 500
    nPop = 20
    url = Room.objects.get(room_id = data["room_id"]).image
    image = Image.open(url.path)
    image_resized = image.resize((VarMaxx+1, VarMaxy+1))
    image_L = image_resized.convert('L')
    Area1 = np.zeros((VarMaxx+1,VarMaxy+1))
    image_matrix = np.array(image_L)
    image_1 =  Image.open(url.path)
    threshold =245
    binary_matrix = np.where(image_matrix > threshold, 255, 0).astype(np.uint8)

    for i in range(VarMaxx+1):
        for j in range(VarMaxy+1):
            if binary_matrix[j,i] == 255:
                Area1[j,i] = 255
            else:
                Area1[j,i] = 1

    ban_position_list = np.argwhere(Area1 == 1)
    ban_position = [(x, y) for y, x in ban_position_list]

    def initialize_population():
        # sink_node = (VarMaxx/2, VarMaxy/2)
        initPop = []
        # initPop.append(sink_node)
        for i in range(0, N):
            check = True
            while check:
                if i == 0 :
                    xi = 100*np.random.rand()
                    yi = 100*np.random.rand()
                else:
                    xp, yp = initPop[np.random.randint(0,i)]
                    Rcom = Rc*np.random.rand()
                    xi = xp + 2*Rcom*np.random.rand()-Rcom
                    if np.random.rand() > 0.5:
                        yi = yp + math.sqrt(Rcom**2 -(xi-xp)**2)
                    else:
                        yi = yp - math.sqrt(Rcom**2 -(xi-xp)**2)
                xi = np.clip(xi, 0, VarMaxx)
                yi = np.clip(yi, 0, VarMaxy)
                xj = int(xi)
                yj = int(yi)
                xj_c = xj+1
                yj_c = yj+1
                xj_t = xj-1
                yj_t = yj-1
                xj_c = np.clip(xj_c, 0, VarMaxx)
                yj_c = np.clip(yj_c, 0, VarMaxy)
                xj_t = np.clip(xj_t, 0, VarMaxx)
                yj_t = np.clip(yj_t, 0, VarMaxy)
                if (Area1[yj,xj] == 255
                    and Area1[yj,xj_c] == 255
                    and Area1[yj,xj_t] == 255
                    and Area1[yj_c,xj] == 255
                    and Area1[yj_t,xj] == 255):
                    check = False
            initPop.append((xi, yi))
        return initPop

    def fitness_function(sensor_nodes):
        M = (VarMaxx+1)*(VarMaxy+1)
        Rss = Rs ** 2 
        matrix_c = np.zeros((VarMaxx+1, VarMaxy+1), dtype=int)  
        grid_x, grid_y = np.meshgrid(np.arange(VarMaxx+1), np.arange(VarMaxy+1), indexing='ij')
        for sensor in sensor_nodes:
            sensor_y, sensor_x = sensor
            distances = (grid_x - sensor_x) ** 2 + (grid_y - sensor_y) ** 2
            matrix_c[distances <= Rss] = 1
        for i in ban_position:
            matrix_c[i[1],i[0]] = 0
        coverage_ratio = round(np.sum(matrix_c) / M, 4)
        return coverage_ratio

    def depth_first_search( u, adjacency_list, visited):
        visited[u]=True
        for i in range(len(adjacency_list[u])):
            if not visited[adjacency_list[u][i]]:
                depth_first_search(adjacency_list[u][i], adjacency_list, visited)

    def check_connectivity(sensor_nodes):
        N = len(sensor_nodes)
        adjacency_list = {i : [] for i in range(N)}
        visited = np.zeros( N, dtype=bool)
        Rcc = Rc**2
        for i in range(N):
            for j in range(N):
                if i != j :
                    distance = (sensor_nodes[i][0] - sensor_nodes[j][0])**2 + (sensor_nodes[i][1] - sensor_nodes[j][1])**2
                    if distance <= Rcc:
                        adjacency_list[i].append(j)
        number = 0 
        for i in range(N):
            if not visited[i]:
                number = number + 1
                depth_first_search( i, adjacency_list, visited)
        if number == 1:
            return True
        return False

    def foa_algorithm():
        population = [initialize_population() for i in range(nPop)]
        index_fitness = [fitness_function(population[i]) for i in range(nPop)]
        best_fitness = max(index_fitness)
        best_solution = population[index_fitness.index(best_fitness)]
        step = 30
        for iteration in range(MaxIt):
            
            for i in range(0, nPop):
                
                k = np.random.randint(1, N)
                solution = np.copy(population[i])
                solution[k][0] = solution[k][0] + (2*step*np.random.rand() - step)
                solution[k][1] = solution[k][1] + (2*step*np.random.rand() - step)
                solution[k][0] = np.clip(solution[k][0], 0, VarMaxx)
                solution[k][1] = np.clip(solution[k][1], 0, VarMaxy)
                xi = int(solution[k][0])
                yi = int(solution[k][1])
                xi_c = xi+1
                yi_c = yi+1
                xi_t = xi-1
                yi_t = yi-1
                xi_c = np.clip(xi_c, 0, VarMaxx)
                yi_c = np.clip(yi_c, 0, VarMaxy)
                xi_t = np.clip(xi_t, 0, VarMaxx)
                yi_t = np.clip(yi_t, 0, VarMaxy)
                if (Area1[yi,xi] == 255
                    and Area1[yi,xi_c] == 255 
                    and Area1[yi,xi_t] == 255
                    and Area1[yi_c,xi] == 255
                    and Area1[yi_t,xi] == 255):
                    
                    if check_connectivity(solution):
                        new_fitness = fitness_function(solution)
                        if new_fitness > index_fitness[i]:
                            index_fitness[i] = new_fitness
                            population[i] = solution

            max_individual = max(index_fitness)
            if max_individual > best_fitness:
                best_fitness = max_individual
                best_solution = population[index_fitness.index(max_individual)]
                population[:]= [best_solution]*nPop
        return best_solution, best_fitness

    small_radius=1

    def draw_circle(ax, center, radius, small_radius):
        # Đường bao  phủ của cảm biến
        outline_circle = plt.Circle(center, radius, fill=False, ec='black', lw=0.8, alpha=1)  
        ax.add_artist(outline_circle)
        
        # Phạm vi cảm biến
        large_circle = plt.Circle(center, radius, color='cyan', alpha=0.2)  
        ax.add_artist(large_circle)

        # Hình tròn nhỏ bên trong
        small_circle = plt.Circle(center, small_radius, fill=False, ec='red', lw=1, alpha=0.7)  
        ax.add_artist(small_circle)
        

    def plot_sensor(sensor_nodes, fitness):

        caculator = round((len(ban_position)/((VarMaxy+1)*(VarMaxx+1))),4)

        fig1, ax = plt.subplots(1, 1)
        ax.set_xlim(0, VarMaxx)
        ax.set_ylim(0, VarMaxy)
        ax.set_aspect('equal', adjustable='box')
        ax.set_xticks(np.arange(0, 101, 10))
        ax.set_yticks(np.arange(0, 101, 10))
        ax.grid(True, linewidth=0.5)
        ax.invert_yaxis()

        for i, node in enumerate(sensor_nodes):
            draw_circle(ax, node, Rs, small_radius)
        ax.imshow(image_1, extent=[0, VarMaxx, VarMaxy, 0])

        ax.set_title(f"Coverage percent: {round(fitness/(1-caculator),4) * 100:.2f} %", fontweight='bold', fontsize=14, color='black')
        for i in range(len(sensor_nodes)):
            for j in range(i+1, len(sensor_nodes)):
                node1, node2 = sensor_nodes[i], sensor_nodes[j]
                distance = np.linalg.norm(np.array(node1) - np.array(node2))
                if distance <= Rc:
                    ax.plot([node1[0], node2[0]], [node1[1], node2[1]], 'b-', linewidth=1)
        buffer1 = io.BytesIO()
        fig1.savefig(buffer1, format='PNG', bbox_inches='tight')
        buffer1.seek(0)

        fig2, ay = plt.subplots(1, 1)
        ay.set_xlim(0, VarMaxx)
        ay.set_ylim(0, VarMaxy)
        ay.set_aspect('equal', adjustable='box')
        ay.set_xticks(np.arange(0, 101, 10))
        ay.set_yticks(np.arange(0, 101, 10))
        ay.grid(True, linewidth=0.5)
        ay.invert_yaxis()

        for i, node in enumerate(sensor_nodes):
            draw_circle(ay, node, Rs, small_radius)
        for bp in ban_position:
            ay.plot(bp[0], bp[1], 'ko', ms = 1)

        ay.set_title(f"Coverage percent: {round(fitness/(1-caculator),4) * 100:.2f} %", fontweight='bold', fontsize=14, color='black')
        for i in range(len(sensor_nodes)):
            for j in range(i+1, len(sensor_nodes)):
                node1, node2 = sensor_nodes[i], sensor_nodes[j]
                distance = np.linalg.norm(np.array(node1) - np.array(node2))
                if distance <= Rc:
                    ay.plot([node1[0], node2[0]], [node1[1], node2[1]], 'b-', linewidth=1)
        buffer2 = io.BytesIO()
        fig2.savefig(buffer2, format='PNG', bbox_inches='tight')
        buffer2.seek(0)

        result = ResultAlgorithm()
        result.room_id = Room.objects.get(room_id = data["room_id"])
        result.image_encode.save(f"coverage_encode_room{data['room_id']}.png", ContentFile(buffer2.read()), save=False)
        result.image_decode.save(f"coverage_decode_room{data['room_id']}.png", ContentFile(buffer1.read()), save=False)
        result.algorithm = data["algorithm"]
        result.save()

        plt.close(fig1)
        plt.close(fig2)

    best_solution, best_fitness = foa_algorithm()
    plot_sensor(best_solution, best_fitness)

from scipy.special import gamma
from scipy.spatial import KDTree
import random
import networkx as nx

def CoverageOptimizationNOAlgorithm(data: dict):
    
    VarMin = 0
    VarMax = 100
    Rc = int(data["Rc"])
    Rs = int(data["Rs"])
    nNode = int(data["number_node"])
    MaxIt = 300
    nPop = 5
    url = Room.objects.get(room_id = data["room_id"]).image
    image = Image.open(url.path)
    image_resized = image.resize((VarMax+1, VarMax+1))
    image_L = image_resized.convert('L')
    Area1 = np.zeros((VarMax+1,VarMax+1))
    image_matrix = np.array(image_L)
    image_1 =  Image.open(url.path)
    threshold =245
    binary_matrix = np.where(image_matrix > threshold, 255, 0).astype(np.uint8)

    for i in range(VarMax+1):
        for j in range(VarMax+1):
            if binary_matrix[j,i] == 255:
                Area1[j,i] = 255
            else:
                Area1[j,i] = 1

    ban_position_list = np.argwhere(Area1 == 1)
    ban_position = [(x, y) for y, x in ban_position_list]

    def levy(n, m, beta):
        num = gamma(1 + beta) * np.sin(np.pi * beta / 2)
        den = gamma((1 + beta) / 2) * beta * 2**((beta - 1) / 2)
        sigma_u = (num / den)**(1 / beta)
        u = np.random.normal(0, sigma_u, (n, m))
        v = np.random.normal(0, 1, (n, m))
        z = u / (np.abs(v)**(1 / beta))
        
        return z

    def fitness_function(sensor_nodes, nNode, Rs, VarMaxX, VarMaxY, ban_position):
        node_pos = np.array(sensor_nodes).reshape(-1, 2)
        M = (VarMaxX + 1) * (VarMaxY + 1)
        Rss = Rs ** 2
        matrix_c = np.zeros((VarMaxX + 1, VarMaxY + 1), dtype=int)
        grid_x, grid_y = np.meshgrid(np.arange(VarMaxX + 1), np.arange(VarMaxY + 1), indexing='ij')
        for i in range(nNode):
            sensor_x, sensor_y = node_pos[i, :]
            distances = (grid_x - sensor_x) ** 2 + (grid_y - sensor_y) ** 2
            matrix_c[distances <= Rss] = 1
        ban_x, ban_y = zip(*ban_position)
        matrix_c[ban_y, ban_x] = 0  # Remove coverage in banned positions
        ban_points = len(ban_position)
        coverage_ratio = np.sum(matrix_c) / (M - ban_points)
        return 1 - round(coverage_ratio, 4)

    def check_connectivity(solution, nNode, Rc):
        # Reshape solution into coordinates
        node_pos = np.array(solution).reshape(-1, 2)
        
        # Use KDTree to find pairs of points within Rc
        tree = KDTree(node_pos)
        pairs = tree.query_pairs(Rc)
        
        # Create a graph and add edges for each pair found
        graph = nx.Graph()
        graph.add_nodes_from(range(nNode))
        graph.add_edges_from(pairs)
        
        # Check if the graph is fully connected
        return nx.is_connected(graph)

    def check_obstacle(x_pos, y_pos, VarMaxX, VarMaxY, obsArea):
        xj = int(x_pos)
        yj = int(y_pos)
        xj = max(0, min(xj, VarMaxX))
        yj = max(0, min(yj, VarMaxY))
        xj_c = xj+1
        yj_c = yj+1
        xj_t = xj-1
        yj_t = yj-1
        xj_c = max(0, min(xj_c, VarMaxX))
        yj_c = max(0, min(yj_c, VarMaxY))
        xj_t = max(0, min(xj_t, VarMaxX))
        yj_t = max(0, min(yj_t, VarMaxY))
        if (obsArea[yj,xj] == 255
            and obsArea[yj,xj_c] == 255 
            and obsArea[yj,xj_t] == 255
            and obsArea[yj_c,xj] == 255
            and obsArea[yj_t,xj] == 255):
            return True
        
        return False

    ###############################################################################
    ############################### SENSOR FUNCTION ###############################
    ###############################################################################

    # Generate new position
    def generate_new_position(x_prev, y_prev, VarMaxX, VarMaxY, Rc, obsArea):
        check = True
        while check is True:
            r = random.uniform(Rc * 0.5, Rc)
            theta = random.uniform(0, 2 * np.pi)

            x_new = x_prev + r * np.cos(theta)
            y_new = y_prev + r * np.sin(theta)
            
            x_new = np.clip(x_new, 0, VarMaxX)
            y_new = np.clip(y_new, 0, VarMaxY)

            if (check_obstacle(x_new, y_new, VarMaxX, VarMaxY, obsArea) is True):
                check = False
        
        return x_new, y_new

    def generate_new_solution(nNode, Rc, VarMaxX, VarMaxY, obsArea):
        solution = np.zeros((nNode, 2))  # Initialize matrix nNode x 2
        x0, y0 = 50, 50  # Initial sensor position
        solution[0, :] = [x0, y0]  # Set initial sensor position
        # Generate positions for the rest of the sensors
        for i in range(1, nNode):
            if (i == 1):
                prevNode = 0
            else:
                prevNode = random.randint(0, i - 1)
            x_prev, y_prev = solution[prevNode, :]
            x_new, y_new = generate_new_position(x_prev, y_prev, VarMaxX, VarMaxY, Rc, obsArea)
            solution[i, :] = [x_new, y_new]
        
        return solution

    def generate_new_generation(nNode, nPop, Rc, VarMaxX, VarMaxY, obsArea):
        initPop = []
        for _ in range(nPop):
            solution = generate_new_solution(nNode,Rc, VarMaxX, VarMaxY, obsArea)
            initPop.append(solution)

        return initPop

    ###############################################################################
    ############################### MAIN FUNCTION #################################
    ###############################################################################

    def NOA(nPop, MaxIt,
            nNode, Rs, Rc,
            VarMin, VarMax,
            ban_position, obsArea):

            dim = 2 * nNode
            lb = VarMin * np.ones(dim)
            ub = VarMax * np.ones(dim)
            # [x11, y11, x12, y12, x13, y13, ... x1n, y1n]

            bestSol = np.zeros(dim)  # Best solution so far

            bestFit = np.inf      # Best score so far
            LFit = np.full((nPop, 1), np.inf)  # Local best for each Nutcracker
            RP = np.zeros((2, dim))  # Reference points
            Convergence_curve = np.zeros(MaxIt)  # Convergence history
            
            Alpha = 0.05  # Controlling parameters
            Pa2 = 0.2
            Prb = 0.2

            pop = generate_new_generation(nNode, nPop, Rc, VarMax, VarMax, obsArea)
            pop = np.array([ [element for pair in row for element in pair] for row in pop])

            Lbest = pop.copy()  # Local best position initialization
            t = 0  # Iteration counter
            
            # Evaluation
            NC_Fit = np.zeros(nPop)
            for i in range(nPop):
                # Calculate fitness value for each solution
                NC_Fit[i] = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                LFit[i] = NC_Fit[i]  # Set local best
                if NC_Fit[i] < bestFit:
                    bestFit = NC_Fit[i]
                    bestSol = pop[i, :].copy()
                    # [x11, y11, x12, y12, x13, y13, ... x1n, y1n]
            
            # in main loop
            while t < MaxIt:
                case=0.0
                RL = 0.05 * levy(nPop, dim, 1.5)

                l = random.random() * (1 - t / MaxIt)
                
                if random.random() < random.random():
                    if (t == 0):
                        a = 0
                    else:
                        a = (t / MaxIt) ** (2 * 1 / t)
                else:
                    a = (1 - (t / MaxIt)) ** (2 * (t / MaxIt))
                
                # if random.random() < 0.75:
                if random.random() < random.random():
                    mo = np.mean(pop, axis=0) # mean of 
                    for i in range(nPop):
                        if random.random() < random.random():
                            mu = random.random()
                        elif random.random() < random.random():
                            mu = random.gauss(0, 1)
                        else:
                            mu = RL[0, 0]
                        
                        cv = random.randint(0, nPop - 1)
                        cv1 = random.randint(0, nPop - 1)
                        Pa1 = (MaxIt - t) / MaxIt

                        currentFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)

                        # Exploration phase 1
                        if random.random() < Pa1:
                            for j in range(dim):
                                cv2 = random.randint(0, nPop - 1)
                                r2 = random.random()
                                # if t < MaxIt / 2: # move global random
                                if random.random() > random.random():
                                    # if random.random() > random.random():
                                    temporary_pos = pop[i, j]
                                    pop[i, j] = mo[j] + RL[i,j] * (pop[cv, j] - pop[cv1,j])
                                    pop[i, j] = max(lb[j], min(pop[i, j], ub[j]))
                                    newFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    if (check_connectivity(pop[i, :], nNode, Rc) == False or newFit > currentFit):
                                        pop[i, j] = temporary_pos
                                    else:
                                        if j % 2 == 0:
                                            if (check_obstacle(pop[i, j], pop[i, j + 1], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        else:
                                            if (check_obstacle(pop[i, j - 1], pop[i, j], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                    case=1.1
                                    
                                else: # explore around a random solution
                                    # if random.random() > random.random():
                                    temporary_pos = pop[i, j]
                                    pop[i, j] = pop[cv2, j] + 0.1 * mu * (pop[cv, j] - pop[cv1, j]) + 0.1 * mu * (random.random() < Alpha) * (r2 * r2 * ub[j] - lb[j])
                                    pop[i, j] = max(lb[j], min(pop[i, j], ub[j]))
                                    newFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    if (check_connectivity(pop[i, :], nNode, Rc) == False or newFit > currentFit):
                                        pop[i, j] = temporary_pos
                                    else:
                                        if j % 2 == 0:
                                            if (check_obstacle(pop[i, j], pop[i, j + 1], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        else:
                                            if (check_obstacle(pop[i, j - 1], pop[i, j], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                    case=1.2

                        # Exploitation phase 1
                        else:
                            mu = random.random()
                            if random.random() < random.random():
                                case=2.1
                                r1 = random.random()
                                for j in range(dim):
                                    temporary_pos = pop[i, j]
                                    pop[i, j] = pop[i, j] + mu * abs(RL[i, j]) * (bestSol[j] - pop[i, j]) + 0.5 * r1 * (pop[cv, j] - pop[cv1, j])
                                    pop[i, j] = max(lb[j], min(pop[i, j], ub[j]))
                                    newFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    if (check_connectivity(pop[i, :], nNode, Rc) == False or newFit > currentFit):
                                        pop[i, j] = temporary_pos
                                    else:
                                        if j % 2 == 0:
                                            if (check_obstacle(pop[i, j], pop[i, j + 1], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        else:
                                            if (check_obstacle(pop[i, j - 1], pop[i, j], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        
                            elif random.random() < random.random():
                                case=2.2  
                                for j in range(dim):
                                    # if random.random() > random.random():
                                    temporary_pos = pop[i, j]
                                    pop[i, j] = bestSol[j] + mu * 0.5 * (pop[cv, j] - pop[cv1, j])
                                    pop[i, j] = max(lb[j], min(pop[i, j], ub[j]))
                                    newFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    if (check_connectivity(pop[i, :], nNode, Rc) == False or newFit > currentFit):
                                        pop[i, j] = temporary_pos
                                    else:
                                        if j % 2 == 0:
                                            if (check_obstacle(pop[i, j], pop[i, j + 1], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        else:
                                            if (check_obstacle(pop[i, j - 1], pop[i, j], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        
                            else:
                                case=2.3
                                for j in range(dim):
                                    currentFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    temporary_pos = pop[i, j]
                                    pop[i, j] = bestSol[j] * abs(l)
                                    pop[i, j] = max(lb[j], min(pop[i, j], ub[j]))
                                    newFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    if (check_connectivity(pop[i, :], nNode, Rc) == False or newFit > currentFit):
                                        pop[i, j] = temporary_pos
                                    else:
                                        if j % 2 == 0:
                                            if (check_obstacle(pop[i, j], pop[i, j + 1], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        else:
                                            if (check_obstacle(pop[i, j - 1], pop[i, j], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit

                        NC_Fit[i] = currentFit
                    
                        # Update the local best according to Eq. (20)
                        if NC_Fit[i] < LFit[i]: # Change this to > for maximization problem
                            LFit[i] = NC_Fit[i]  # Update the local best fitness
                            Lbest[i, :] = pop[i, :].copy() # Update the local best position
                        else:
                            NC_Fit[i] = LFit[i]
                            pop[i, :] = Lbest[i, :]
                        
                        if NC_Fit[i] < bestFit: # Change this to > for maximization problem
                            bestFit = NC_Fit[i] # Update best-so-far fitness
                            bestSol = pop[i, :].copy() # Update best-so-far 
                
                else:
                    skipSol = False
                    # Cache-search and Recovery strategy
                    ## Compute the reference points for each Nutcraker
                    for i in range(nPop):
                        currentFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                        ang = np.pi * random.random()
                        cv = random.randint(0, nPop - 1)
                        cv1 = random.randint(0, nPop - 1)
                        for j in range(dim):
                            for j1 in range(2):
                                if j1 == 1:
                                    # Random position of 1st object around sensor 
                                    if ang != np.pi / 2:
                                        RP[j1, j] = pop[i, j] + a * np.cos(ang) * (pop[cv, j] - pop[cv1, j])
                                        if j % 2 == 0:
                                            if (check_obstacle(RP[j1, j], RP[j1, j+1], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                        else:
                                            if (check_obstacle(RP[j1, j-1], RP[j1, j], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                                
                                    else:
                                        RP[j1, j] = pop[i, j] + a * RP[random.randint(0, 1), j]
                                        if j % 2 == 0:
                                            if (check_obstacle(RP[j1, j], RP[j1, j+1], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                        else:
                                            if (check_obstacle(RP[j1, j-1], RP[j1, j], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                else:
                                    # Compute the second reference point for the ith Nutcraker
                                    if ang != np.pi / 2:
                                        RP[j1, j] = pop[i, j] + a * np.cos(ang) * ((ub[j] - lb[j]) + lb[j]) * (random.random() < Prb)
                                        if j % 2 == 0:
                                            if (check_obstacle(RP[j1, j], RP[j1, j+1], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                        else:
                                            if (check_obstacle(RP[j1, j-1], RP[j1, j], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                    else:
                                        RP[j1, j] = pop[i, j] + a * RP[random.randint(0, 1), j] * (random.random() < Prb)
                                        if j % 2 == 0:
                                            if (check_obstacle(RP[j1, j], RP[j1, j+1], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                        else:
                                            if (check_obstacle(RP[j1, j-1], RP[j1, j], VarMax, VarMax, obsArea) is False):
                                                skipSol = True
                                if (skipSol is True):
                                    break
                            if (skipSol is True):
                                break
                        
                        RP[1, :] = np.clip(RP[1, :], lb, ub)
                        RP[0, :] = np.clip(RP[0, :], lb, ub)

                        # Exploitation phase 2  
                        if random.random() < Pa2:
                            cv = random.randint(0, nPop - 1)
                            for j in range(dim):
                                if random.random() < random.random():
                                    # if random.random() > random.random():
                                    temporary_pos = pop[i, j]
                                    pop[i, j] = pop[i, j] + (random.random() * (bestSol[j] - pop[i, j]) + random.random() * (RP[0, j] - pop[cv, j]))
                                    pop[i, j] = max(lb[j], min(pop[i, j], ub[j]))
                                    newFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    if (check_connectivity(pop[i, :], nNode, Rc) == False or newFit > currentFit):
                                        pop[i, j] = temporary_pos
                                    else:
                                        if j % 2 == 0:
                                            if (check_obstacle(pop[i, j], pop[i, j + 1], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        else:
                                            if (check_obstacle(pop[i, j - 1], pop[i, j], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                    case=3.1
                                        
                                else:
                                    # if random.random() > random.random(): # global search if nutcracker does not find
                                    temporary_pos = pop[i, j]
                                    pop[i, j] = pop[i, j] + (random.random() * (bestSol[j] - pop[i, j]) + random.random() * (RP[1, j] - pop[cv, j]))
                                    pop[i, j] = max(lb[j], min(pop[i, j], ub[j]))
                                    newFit = fitness_function(pop[i, :], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                                    if (check_connectivity(pop[i, :], nNode, Rc) == False or newFit > currentFit):
                                        pop[i, j] = temporary_pos
                                    else:
                                        if j % 2 == 0:
                                            if (check_obstacle(pop[i, j], pop[i, j + 1], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                        else:
                                            if (check_obstacle(pop[i, j - 1], pop[i, j], VarMax, VarMax, obsArea) is False):
                                                pop[i, j] = temporary_pos
                                            else:
                                                currentFit = newFit
                                    case=3.2
                            
                            NC_Fit[i] = currentFit
                            
                            # Update the local best
                            if NC_Fit[i] < LFit[i]: # Change this to > for maximization problem
                                LFit[i] = NC_Fit[i]
                                Lbest[i, :] = pop[i, :].copy()
                            else:
                                NC_Fit[i] = LFit[i]
                                pop[i, :] = Lbest[i, :]
                            
                            # Update the best-so-far solution
                            if NC_Fit[i] < bestFit:
                                bestFit = NC_Fit[i] # Update best-so-far fitness
                                bestSol = pop[i, :].copy() # Update best-so-far 
                        
                        # Exploration stage 2: Cache-search stage
                        else:
                            # Evaluation
                            NC_Fit1 = fitness_function(RP[0], nNode, Rs, VarMax + 1 , VarMax + 1, ban_position)
                            
                            # Evaluations
                            NC_Fit2 = fitness_function(RP[1], nNode, Rs, VarMax + 1, VarMax + 1, ban_position)
                            
                            # Applying Eq. (17) to trade-off between the exploration behaviors
                            if NC_Fit2 < NC_Fit1 and NC_Fit2 < NC_Fit[i]:
                                temp = RP[1, :]
                                if (check_connectivity(RP[1, :], nNode, Rc) == True and skipSol is False):
                                    NC_Fit[i] = NC_Fit2
                                    pop[i, :] = temp
                                case=4.1

                            elif NC_Fit1 < NC_Fit2 and NC_Fit1 < NC_Fit[i]:
                                temp = RP[0, :]
                                if (check_connectivity(RP[0, :], nNode, Rc) == True and skipSol is False):
                                    pop[i, :] = temp
                                    NC_Fit[i] = NC_Fit1
                                case=4.2
                            
                            # Update the local best
                            if NC_Fit[i] < LFit[i]:
                                LFit[i] = NC_Fit[i]
                                Lbest[i, :] = pop[i, :].copy()
                            else:
                                NC_Fit[i] = LFit[i]
                                pop[i, :] = Lbest[i, :]
                            
                            # Update the best-so-far solution
                            if NC_Fit[i] < bestFit:
                                bestFit = NC_Fit[i]
                                bestSol = pop[i, :].copy()

                t += 1
                Convergence_curve[t - 1] = bestFit
                if t >= MaxIt:
                    break

            return bestSol, bestFit

    small_radius=1

    def draw_circle(ax, center, radius, small_radius):
        # Đường bao  phủ của cảm biến
        outline_circle = plt.Circle(center, radius, fill=False, ec='black', lw=0.8, alpha=1)  
        ax.add_artist(outline_circle)
        
        # Phạm vi cảm biến
        large_circle = plt.Circle(center, radius, color='cyan', alpha=0.2)  
        ax.add_artist(large_circle)

        # Hình tròn nhỏ bên trong
        small_circle = plt.Circle(center, small_radius, fill=False, ec='red', lw=1, alpha=0.7)  
        ax.add_artist(small_circle)
        

    def plot_sensor(sensor_nodes, fitness):

        caculator = round((len(ban_position)/((VarMax+1)*(VarMax+1))),4)

        fig1, ax = plt.subplots(1, 1)
        ax.set_xlim(0, VarMax)
        ax.set_ylim(0, VarMax)
        ax.set_aspect('equal', adjustable='box')
        ax.set_xticks(np.arange(0, 101, 10))
        ax.set_yticks(np.arange(0, 101, 10))
        ax.grid(True, linewidth=0.5)
        ax.invert_yaxis()

        for i, node in enumerate(sensor_nodes):
            draw_circle(ax, node, Rs, small_radius)
        ax.imshow(image_1, extent=[0, VarMax, VarMax, 0])

        ax.set_title(f"Coverage percent: {round((1-fitness),4)*100:.2f} %", fontweight='bold', fontsize=14, color='black')
        for i in range(len(sensor_nodes)):
            for j in range(i+1, len(sensor_nodes)):
                node1, node2 = sensor_nodes[i], sensor_nodes[j]
                distance = np.linalg.norm(np.array(node1) - np.array(node2))
                if distance <= Rc:
                    ax.plot([node1[0], node2[0]], [node1[1], node2[1]], 'b-', linewidth=1)
        buffer1 = io.BytesIO()
        fig1.savefig(buffer1, format='PNG', bbox_inches='tight')
        buffer1.seek(0)

        fig2, ay = plt.subplots(1, 1)
        ay.set_xlim(0, VarMax)
        ay.set_ylim(0, VarMax)
        ay.set_aspect('equal', adjustable='box')
        ay.set_xticks(np.arange(0, 101, 10))
        ay.set_yticks(np.arange(0, 101, 10))
        ay.grid(True, linewidth=0.5)
        ay.invert_yaxis()

        for i, node in enumerate(sensor_nodes):
            draw_circle(ay, node, Rs, small_radius)
        for bp in ban_position:
            ay.plot(bp[0], bp[1], 'ko', ms = 1)

        ay.set_title(f"Coverage percent: {round((1-fitness),4)*100:.2f} %", fontweight='bold', fontsize=14, color='black')
        for i in range(len(sensor_nodes)):
            for j in range(i+1, len(sensor_nodes)):
                node1, node2 = sensor_nodes[i], sensor_nodes[j]
                distance = np.linalg.norm(np.array(node1) - np.array(node2))
                if distance <= Rc:
                    ay.plot([node1[0], node2[0]], [node1[1], node2[1]], 'b-', linewidth=1)
        buffer2 = io.BytesIO()
        fig2.savefig(buffer2, format='PNG', bbox_inches='tight')
        buffer2.seek(0)

        result = ResultAlgorithm()
        result.room_id = Room.objects.get(room_id = data["room_id"])
        result.image_encode.save(f"coverage_encode_room{data['room_id']}.png", ContentFile(buffer2.read()), save=False)
        result.image_decode.save(f"coverage_decode_room{data['room_id']}.png", ContentFile(buffer1.read()), save=False)
        result.algorithm = data["algorithm"]
        result.save()
        plt.close(fig1)
        plt.close(fig2)

    best_solution, best_fitness = NOA(
        nPop, MaxIt,
        nNode, Rs, Rc,
        VarMin, VarMax,
        ban_position, Area1)
    best_solution = np.array(best_solution).reshape(-1, 2)
    plot_sensor(best_solution, best_fitness)

if __name__ == '__main__':
    CoverageOptimizationFOAAlgorithm({
        "room_id" : 407,
        "Rc":20,
        "Rs":20,
        "number_node": 10,
    })